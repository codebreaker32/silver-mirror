import { useParams } from 'react-router';

export function SharedResult() {
  const { token } = useParams();
  return <h1>Result {token}</h1>;
}
