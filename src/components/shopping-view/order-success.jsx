import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {  useNavigate } from 'react-router-dom';




function OrderSuccess() {
  const navigate = useNavigate(); 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100">
          <CheckCircle className="text-green-500" size={64} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Order Placed!</h1>
        <p className="text-gray-600">Thank you for your order. It has been successfully placed.</p>
        <Button
          onClick={() => navigate('/shop/orders')} 
          className="mt-4 w-full sm:w-auto"
        >
          Go to Orders
        </Button>
      </div>
    </div>
  );
}

export default OrderSuccess;
