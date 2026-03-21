const AuthorCard = ({ author }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {author.name}
      </h3>
      {author.affiliation && (
        <p className="text-xs text-gray-500 mb-1">{author.affiliation}</p>
      )}
      <p className="text-xs text-gray-500">
        ORCID:
        {' '}
        {author.orcid_id || 'N/A'}
      </p>
    </div>
  );
};

export default AuthorCard;

