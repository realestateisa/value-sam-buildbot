import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/embed-demo');
  }, [navigate]);

  return null;
};

export default Index;
