import { CampaignBrief, Product } from '../models/campaign-brief.model';
import { ComplianceCheckResult } from '../models/report.model';

const BANNED_TERMS = [
  'guaranteed',
  'miracle',
  'instant cure',
  'risk-free',
  '100% effective',
  'cure all',
  'no side effects',
  'fda approved',
  'clinically proven overnight',
];

export class ComplianceService {
  runChecks(brief: CampaignBrief, product: Product, hasLogo: boolean): ComplianceCheckResult[] {
    const checks: ComplianceCheckResult[] = [];

    checks.push({
      check: 'campaign_message_present',
      category: 'brand',
      passed: Boolean(brief.message?.trim()),
      message: brief.message?.trim()
        ? 'Campaign message is present'
        : 'Campaign message is missing',
    });

    checks.push({
      check: 'brand_colors_specified',
      category: 'brand',
      passed: Boolean(brief.brandColors && brief.brandColors.length > 0),
      message:
        brief.brandColors && brief.brandColors.length > 0
          ? `Brand colors specified: ${brief.brandColors.join(', ')}`
          : 'No brand colors specified in brief',
    });

    checks.push({
      check: 'logo_present',
      category: 'brand',
      passed: hasLogo,
      message: hasLogo
        ? 'Logo asset detected and composited'
        : 'No logo asset provided',
    });

    checks.push({
      check: 'product_description_present',
      category: 'brand',
      passed: Boolean(product.description?.trim()),
      message: product.description?.trim()
        ? 'Product description is present'
        : 'Product description is missing',
    });

    const messageToScan = [
      brief.message,
      ...brief.regions.map((r) => r.localizedMessage).filter(Boolean),
    ].join(' ');

    const foundTerms = BANNED_TERMS.filter((term) =>
      messageToScan.toLowerCase().includes(term.toLowerCase())
    );

    checks.push({
      check: 'prohibited_terms',
      category: 'legal',
      passed: foundTerms.length === 0,
      message:
        foundTerms.length === 0
          ? 'No prohibited marketing terms detected'
          : `Prohibited terms found: ${foundTerms.join(', ')}`,
    });

    return checks;
  }
}
