const PublicationCard = ({ paper, onEdit, onDelete, canEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {paper.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          {paper.journal_name ? `${paper.journal_name} • ` : ''}
          {paper.year}
        </p>
        {paper.abstract && (
          <p className="text-sm text-gray-700 line-clamp-3 mb-2">
            {paper.abstract}
          </p>
        )}
        <p className="text-xs text-gray-500">
          DOI:
          {' '}
          {paper.doi || 'N/A'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Citations:
          {' '}
          <span className="font-semibold">{paper.citation_count ?? 0}</span>
        </p>
      </div>
      {canEdit && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded hover:bg-primary-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicationCard;

