import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (!links.length) return null;

    return (
        <nav className="pagination">
            {links.map((link, index) => (
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        className={link.active ? 'active' : ''}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span key={index} className="disabled" dangerouslySetInnerHTML={{ __html: link.label }} />
                )
            ))}
        </nav>
    );
}
