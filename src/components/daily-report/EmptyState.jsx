const EmptyState = ({ icon: Icon, title, description }) => (
  <tr>
    <td colSpan="10" className="p-12">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon size={40} className="text-gray-300" />
        </div>
        <p className="text-lg font-semibold text-gray-500">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </td>
  </tr>
);

export default EmptyState;