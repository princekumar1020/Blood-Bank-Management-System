import { useEffect, useState } from "react";
import { AdminAPI } from "../services/api";

const LOW_STOCK_THRESHOLD = 5;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await AdminAPI.get("/admin/inventory");
        setInventory(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Create full inventory with all blood groups
  const fullInventory = BLOOD_GROUPS.map(bloodGroup => {
    const item = inventory.find(inv => inv.bloodGroup === bloodGroup);
    return item ? item : { _id: bloodGroup, bloodGroup, units: 0 };
  });

  const lowStockItems = fullInventory.filter(item => item.units <= LOW_STOCK_THRESHOLD);

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory</h1>
        <p className="text-gray-600">View current blood stock and low stock alerts.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {fullInventory.map(item => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{item.bloodGroup}</h3>
                  {item.units <= LOW_STOCK_THRESHOLD ? (
                    <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">Low</span>
                  ) : (
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">Healthy</span>
                  )}
                </div>
                <p className="text-5xl font-bold text-gray-900">{item.units}</p>
                <p className="text-sm text-gray-500 mt-1">Units available</p>
              </div>
            ))}

            {fullInventory.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-lg">
                No inventory records found.
              </div>
            )}
          </div>

          {lowStockItems.length > 0 && (
            <div className="space-y-4">
              {lowStockItems.map(item => (
                <div key={item._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h2 className="font-semibold text-red-700 mb-2">Low Stock Alert for {item.bloodGroup}</h2>
                  <p className="text-sm text-red-600">Blood group {item.bloodGroup} has only {item.units} units remaining (threshold: {LOW_STOCK_THRESHOLD} units). Please arrange for more donations.</p>
                </div>
              ))}
            </div>
          )}

          {lowStockItems.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              All blood groups are above the low-stock threshold.
            </div>
          )}
        </>
      )}
    </div>
  );
}
