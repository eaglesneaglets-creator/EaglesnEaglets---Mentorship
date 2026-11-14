import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

/**
 * PageHeader — the one header every dashboard page uses: optional
 * breadcrumbs, the page's single <h1>, a one-line description, and the
 * page-level actions on the right (stacked under the title on phones).
 *
 *   <PageHeader
 *     title="Grading Center"
 *     description="Review and score submissions from your eaglets."
 *     breadcrumbs={[{ label: 'My Nest', to: '/eagle/nests' }, { label: 'Grading' }]}
 *     actions={<Button>New assignment</Button>}
 *   />
 */
const PageHeader = ({ title, description, breadcrumbs, actions, className }) => (
  <header className={cn('mb-6 flex flex-col gap-3', className)}>
    {breadcrumbs?.length > 0 && (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <Fragment key={`${crumb.label}-${index}`}>
                <BreadcrumbItem>
                  {isLast || !crumb.to ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )}

    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  </header>
);

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, to: PropTypes.string }),
  ),
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default PageHeader;
