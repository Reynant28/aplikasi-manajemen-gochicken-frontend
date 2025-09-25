// src/pages/ReportsPage.jsx

const ReportsPage = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1 border-b">
              <button className="px-4 py-2 text-sm font-semibold text-green-600 border-b-2 border-green-600">Overview</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Engagement</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Monetization</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">User Attribute</button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700">Export</button>
          <button className="bg-white border border-gray-300 px-5 py-2 rounded-lg font-semibold hover:bg-gray-50">Filter</button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <button className='bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-semibold'>All Users</button>
        <button className='bg-white border border-gray-300 px-4 py-1.5 rounded-full font-semibold text-gray-600 hover:bg-gray-50'>Add Comparison +</button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2">
          <UserTrafficChart />
        </div>
        <div>
          <TopTrafficChart />
        </div>

        {/* Metric Cards Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <DashboardCard title="Total Session" value="145.8K" />
            <DashboardCard title="Bounce Rate" value="47.1%" />
            <DashboardCard title="Engagement Rate">
               <p className="text-3xl font-bold text-gray-800 mb-2">84.2%</p>
               <div className='h-16 w-full bg-gray-200 rounded-md flex items-end justify-between px-1'>
                  <div className='w-3 bg-gray-300 rounded-t-sm' style={{height: '30%'}}></div>
                  <div className='w-3 bg-gray-300 rounded-t-sm' style={{height: '40%'}}></div>
                  <div className='w-3 bg-gray-300 rounded-t-sm' style={{height: '20%'}}></div>
                  <div className='w-3 bg-green-600 rounded-t-sm' style={{height: '90%'}}></div>
                  <div className='w-3 bg-gray-300 rounded-t-sm' style={{height: '50%'}}></div>
                  <div className='w-3 bg-gray-300 rounded-t-sm' style={{height: '30%'}}></div>
                  <div className='w-3 bg-gray-300 rounded-t-sm' style={{height: '25%'}}></div>
               </div>
            </DashboardCard>
            <DashboardCard title="Total User" value="666K" />
            <DashboardCard title="Avg. Scroll Depth" value="58.2%" />
            <DashboardCard title="Avg. Page/Session" value="13.9K" />
        </div>
      </div>
    </>
  );
};

export default ReportsPage;