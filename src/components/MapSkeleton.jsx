import ContentLoader from 'react-content-loader';

const MapSkeleton = (props) => (
  <ContentLoader
    speed={2}
    width={650}
    height={650}
    viewBox="0 0 700 700"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}>
    <rect x="0" y="0" rx="20" ry="20" width="650" height="650" />
  </ContentLoader>
);

export default MapSkeleton;
