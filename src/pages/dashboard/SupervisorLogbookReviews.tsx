import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function SupervisorLogbookReviews() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard/supervisor', { replace: true });
  }, [navigate]);
  return null;
}