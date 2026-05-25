import { ProductOutput } from '../types';

interface ComplianceStatusProps {
  products: ProductOutput[];
}

export default function ComplianceStatus({ products }: ComplianceStatusProps) {
  if (products.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Compliance Status</h2>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={`${product.productSlug}-${product.region}`}>
            <p className="mb-2 text-sm font-medium text-gray-700">
              {product.productName}
              {products.filter((p) => p.productName === product.productName).length > 1 &&
                ` (${product.region.toUpperCase()})`}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.compliance.map((check) => (
                <span
                  key={check.check}
                  title={check.message}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    check.passed
                      ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                      : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  }`}
                >
                  {check.passed ? '✓' : '✗'} {check.check.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
