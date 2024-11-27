import { useState,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../ui/use-toast';
import { Dialog, DialogContent } from '../ui/dialog';
import StarRatingComponent from '../common/star-rating';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { addReview, getReviews } from '@/store/shop/review-slice';
import { fetchCartItems } from '@/store/shop/cart-slice';
import { fetchProductDetails, setProductDetails } from '@/store/shop/products-slice';

function ProductDetailsDialog() {
  const navigate = useNavigate();  
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { toast } = useToast();
  const { id } = useParams();
  const { productDetails } = useSelector((state) => state.shopProducts);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
  }, [id, dispatch]);
  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleBuyItem(getCurrentProductId) {
    sessionStorage.setItem(
      'currentProductId',
      JSON.stringify(getCurrentProductId)
    );
    navigate('/shop/checkout', { state: productDetails });
  }



  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  console.log(reviews, "reviews");

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <div className="container mx-auto py-8 px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={productDetails?.image}
          alt={productDetails?.title}
         
          className="w-full object-cover"
        />
      </div>
      <div className="">
        <h1 className="text-2xl font-extrabold">{productDetails?.title}</h1>
        <p className="text-muted-foreground text-sm mb-4 mt-2">
          {productDetails?.description}
        </p>
        <div className="flex items-center justify-between">
          <p
            className={`text-xl font-bold text-primary ${
              productDetails?.salePrice > 0 ? "line-through" : ""
            }`}
          >
            ${productDetails?.price}
          </p>
          {productDetails?.salePrice > 0 ? (
            <p className="text-lg font-bold text-muted-foreground">
              ${productDetails?.salePrice}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            <StarRatingComponent rating={averageReview} />
          </div>
          <span className="text-muted-foreground text-sm">
            ({averageReview.toFixed(2)})
          </span>
        </div>
        <div className="mt-5">
          {productDetails?.totalStock === 0 ? (
            <Button className="w-full opacity-60 cursor-not-allowed">
              Out of Stock
            </Button>
          ) : (
            <>
              <Button
                className="w-full mb-3 bg-white text-black border border-black hover:text-white"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
              <Button
                className="w-full"
                onClick={() =>
                  handleBuyItem(productDetails?._id)
                }
              >
                Buy Now
              </Button>
            </>
          )}
        </div>
        <Separator className="my-6" />
        <div className="max-h-[200px] overflow-auto">
          <h2 className="text-lg font-bold mb-4">Reviews</h2>
          {reviews && reviews.length > 0 ? (
            reviews.map((reviewItem) => (
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback>
                    {reviewItem?.userName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h3 className="font-bold text-sm">{reviewItem?.userName}</h3>
                  <div className="flex items-center">
                    <StarRatingComponent rating={reviewItem?.reviewValue} />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {reviewItem.reviewMessage}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No Reviews</p>
          )}
        </div>
        <div className="mt-6">
          <Label className="text-sm">Write a review</Label>
          <div className="flex gap-2 mt-2">
            <StarRatingComponent
              rating={rating}
              handleRatingChange={handleRatingChange}
            />
          </div>
          <Input
            name="reviewMsg"
            value={reviewMsg}
            onChange={(event) => setReviewMsg(event.target.value)}
            placeholder="Write a review..."
            className="mt-2"
          />
          <Button
            onClick={handleAddReview}
            disabled={reviewMsg.trim() === ""}
            className="mt-2"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
}

export default ProductDetailsDialog;
