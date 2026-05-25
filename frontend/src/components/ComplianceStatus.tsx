import { ProductOutput } from '../types';

interface ComplianceStatusProps {
  products: ProductOutput[];
}

export default function ComplianceStatus({ products }: ComplianceStatusProps) {
  if (products.length === 0) return null;

  const allChecks = products.flatMap((p) =>
    p.compliance.map((c) => ({ ...c, product: p.productName, region: p.region }))
  );
  const passed = allChecks.filter((c) => c.passed).length;
  const total = allChecks.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Compliance
        </h3>
        <span
          className={`text-xs font-medium ${passed === total ? 'text-emerald-400' : 'text-amber-400'}`}
        >
          {passed}/{total} passed
        </span>
      </div>

      <div className="space-y-2">
        {products.map((product) => {
          const failures = product.compliance.filter((c) => !c.passed);
          const allPass = failures.length === 0;

          return (
            <div
              key={`${product.productSlug}-${product.region}`}
              className="rounded-lg bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-300">{product.productName}</p>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    allPass
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {product.region}
                </span>
              </div>
              {!allPass && (
                <p className="mt-1 text-xs text-zinc-500">
                  {failures.map((f) => f.check.replace(/_/g, ' ')).join(', ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
