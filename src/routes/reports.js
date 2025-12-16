// routes/reports.js - Tambahkan endpoint baru
router.get('/profit-loss', auth, async (req, res) => {
    try {
        const { filter = 'bulan' } = req.query;
        
        // Hitung total pendapatan dari transaksi
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

        // Hitung total HPP (Harga Pokok Penjualan)
        const cogsResult = await Transaction.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: getDateFilter(filter)
                }
            },
            {
                $unwind: '$items'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $unwind: '$productData'
            },
            {
                $group: {
                    _id: null,
                    totalCOGS: {
                        $sum: {
                            $multiply: [
                                '$items.quantity',
                                '$productData.purchasePrice' // Harga beli produk
                            ]
                        }
                    }
                }
            }
        ]);

        // Hitung biaya operasional (contoh sederhana)
        const operationalCosts = await OperationalCost.aggregate([
            {
                $match: {
                    date: getDateFilter(filter)
                }
            },
            {
                $group: {
                    _id: null,
                    totalOperational: { $sum: '$amount' }
                }
            }
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        const totalCOGS = cogsResult[0]?.totalCOGS || 0;
        const totalOperational = operationalCosts[0]?.totalOperational || 0;
        
        const grossProfit = totalRevenue - totalCOGS;
        const netProfit = grossProfit - totalOperational;

        res.json({
            status: 'success',
            data: {
                totalRevenue,
                totalCOGS,
                grossProfit,
                operationalCosts: totalOperational,
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

// Helper function untuk filter tanggal
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