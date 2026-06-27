import { mockData } from '@shell-platform/mock-data';
import type { OrderStatus } from '@shell-platform/mock-data';

const statusClass: Record<OrderStatus, string> = {
  pending: 'status-pending',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-badge ${statusClass[status]}`}>{status}</span>
  );
}

export default function Dashboard() {
  const totalOrders = mockData.orders.length;
  const inTransitShipments = mockData.shipments.filter(
    (s) => s.status === 'in-transit'
  ).length;
  const lowStockItems = mockData.inventory.filter(
    (i) => i.quantity < i.reorderLevel
  ).length;
  const totalSuppliers = mockData.suppliers.length;

  const stats = [
    { label: 'Total Orders', value: totalOrders },
    { label: 'In-Transit Shipments', value: inTransitShipments },
    { label: 'Low Stock Items', value: lowStockItems },
    { label: 'Total Suppliers', value: totalSuppliers },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="cs-stat-card">
            <p className="cs-stat-label">{stat.label}</p>
            <p className="cs-stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="cs-table-wrap">
        <div className="cs-card-header">Recent Orders</div>
        <div className="overflow-x-auto">
          <table className="cs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Region</th>
              </tr>
            </thead>
            <tbody>
              {mockData.orders.map((order) => (
                <tr key={order.id}>
                  <td
                    className="font-mono"
                    style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                  >
                    {order.id}
                  </td>
                  <td>{order.customer}</td>
                  <td>{order.product}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>{order.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
