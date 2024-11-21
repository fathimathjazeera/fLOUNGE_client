import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewOrder } from '@/store/shop/order-slice';
import { useToast } from '@/components/ui/use-toast';
import Address from '@/components/shopping-view/address';
import UserCartItemsContent from '@/components/shopping-view/cart-items-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import img from '../../assets/account.jpg';
import { Label } from '@/components/ui/label';
import { useNavigate} from 'react-router-dom';

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control the modal state
  const dispatch = useDispatch();
  const { toast } = useToast();
const navigate = useNavigate()

  const totalCartAmount =
    cartItems?.items?.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleCheckout() {
    if (!cartItems?.items?.length) {
      toast({
        title: 'Your cart is empty. Please add items to proceed.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: 'Please select an address to proceed.',
        variant: 'destructive',
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((item) => ({
        productId: item?.productId,
        title: item?.title,
        image: item?.image,
        price: item?.salePrice > 0 ? item?.salePrice : item?.price,
        quantity: item?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    };

    if (paymentMethod === 'paypal') {
      dispatch(createNewOrder(orderData)).then((data) => {
        if (data?.payload?.success) {
          window.location.href = data.payload.approvalURL;
        } else {
          toast({
            title: 'PayPal payment initiation failed.',
            variant: 'destructive',
          });
        }
      });
    } else if (paymentMethod === 'COD') {
      orderData.paymentStatus = 'pending';
      orderData.orderStatus = 'placed';

      dispatch(createNewOrder(orderData)).then((data) => {
        if (data?.payload?.success) {
     navigate('/shop/order-success');
          setIsDialogOpen(false); 
        } else {
          toast({
            title: 'Failed to place COD order.',
            variant: 'destructive',
          });
        }
      });
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" alt="Account" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems?.items?.map((item) => (
            <UserCartItemsContent key={item.productId} cartItem={item} />
          ))}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${totalCartAmount}</span>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
                Checkout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="text-lg font-semibold">
                Select Payment Method
              </DialogTitle>
              <DialogDescription className="mb-0">
                Please choose your preferred payment method to complete the checkout.
              </DialogDescription>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-2 flex flex-col"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">Pay with PayPal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="COD" id="COD" />
                  <Label htmlFor="COD">Pay with Cash on Delivery (COD)</Label>
                </div>
              </RadioGroup>

              <DialogFooter>
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                >
                  Continue with {paymentMethod === 'paypal' ? 'PayPal' : 'COD'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
