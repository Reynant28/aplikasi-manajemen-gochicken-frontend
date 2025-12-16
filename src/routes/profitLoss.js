// routes/profitLoss.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

router.get('/profit-loss', auth, async (req, res) => {
    try {
        const { filter = 'bulan' } = req.query;
        
        // Hitung total pendapatan
        const revenueResult = await Transaction.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: getDateFilter(filter)
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        
        // Asumsi untuk bisnis makanan:
        const totalCOGS = totalRevenue * 0.5; // 50% HPP
        const operationalCosts = totalRevenue * 0.25; // 25% biaya operasional
        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - operationalCosts;

        res.json({
            status: 'success',
            data: {
                totalRevenue,
                totalCOGS,
                grossProfit,
                operationalCosts,
                netProfit,
                profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

function getDateFilter(filter) {
    const now = new Date();
    let startDate;
    
    switch (filter) {
        case 'minggu':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'bulan':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'tahun':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return { $gte: startDate };
}

module.exports = router;