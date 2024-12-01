import { Button } from '@/components/ui/button';
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from '@/store/shop/products-slice';
import ShoppingProductTile from '@/components/shopping-view/product-tile';
import { useNavigate } from 'react-router-dom';
import { addToCart, fetchCartItems } from '@/store/shop/cart-slice';
import { useToast } from '@/components/ui/use-toast';
import ProductDetailsDialog from '@/components/shopping-view/product-details';
import { getFeatureImages } from '@/store/common-slice';
import ShoppingLayout from '@/components/shopping-view/layout';

const categoriesWithIcon = [
  { id: 'men', label: 'Men', icon: ShirtIcon },
  { id: 'women', label: 'Women', icon: CloudLightning },
  { id: 'kids', label: 'Kids', icon: BabyIcon },
  { id: 'accessories', label: 'Accessories', icon: WatchIcon },
  { id: 'footwear', label: 'Footwear', icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: 'nike', label: 'Nike', icon: Shirt },
  { id: 'adidas', label: 'Adidas', icon: WashingMachine },
  { id: 'puma', label: 'Puma', icon: ShoppingBasket },
  { id: 'levi', label: "Levi's", icon: Airplay },
  { id: 'zara', label: 'Zara', icon: Images },
  { id: 'h&m', label: 'H&M', icon: Heater },
];

const smallerScreenImg = [
  { image: 'https://www.searchenginejournal.com/wp-content/uploads/2022/08/google-shopping-ads-6304dccb7a49e-sej.png' },
  { image: 'https://img.freepik.com/free-photo/surprised-girl-pink-culottes-posing-with-trolley-full-multi-colored-packages-with-new-clothes_197531-14251.jpg' },
  { image: 'https://st4.depositphotos.com/4678277/40811/i/450/depositphotos_408110334-stock-photo-full-length-body-size-view.jpg' },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Update state based on screen width
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup on component unmount
    };
  }, []);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: 'price-lowtohigh',
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem('filters');
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem('filters', JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId) {
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
          title: 'Product is added to cart',
        });
      }
    });
  }

  return (
    <>
      <ShoppingLayout />
      <div className="flex flex-col min-h-screen">
        <div className="relative w-full h-[600px] sm:h-[300px] md:h-[400px] lg:h-[600px] overflow-hidden">
          {(isMobile ? smallerScreenImg : featureImageList).map((slide, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 
                ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={slide?.image}
                className="w-full h-full object-cover object-center 
                  sm:h-[200px] sm:object-contain 
                  md:h-full md:object-cover lg:object-cover"
                alt={`Feature Slide ${index + 1}`}
              />
              {/* Responsive Chevron Buttons */}
              <div className="absolute inset-0 pointer-events-none">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentSlide(
                      (prevSlide) => (prevSlide - 1 + featureImageList.length) % featureImageList.length
                    )
                  }
                  className="pointer-events-auto absolute top-1/2 left-4 transform -translate-y-1/2 
                    sm:left-2 sm:w-8 sm:h-8 md:left-4 md:w-10 md:h-10 bg-white/80 p-2 z-10 
                    flex items-center justify-center"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentSlide(
                      (prevSlide) => (prevSlide + 1) % featureImageList.length
                    )
                  }
                  className="pointer-events-auto absolute top-1/2 right-4 transform -translate-y-1/2 
                    sm:right-2 sm:w-8 sm:h-8 md:right-4 md:w-10 md:h-10 bg-white/80 p-2 z-10 
                    flex items-center justify-center"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Shop by category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categoriesWithIcon.map((categoryItem) => (
                <Card
                  onClick={() =>
                    handleNavigateToListingPage(categoryItem, 'category')
                  }
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <categoryItem.icon className="w-12 h-12 mb-4 text-primary" />
                    <span className="font-bold">{categoryItem.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {brandsWithIcon.map((brandItem) => (
                <Card
                  onClick={() => handleNavigateToListingPage(brandItem, 'brand')}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <brandItem.icon className="w-12 h-12 mb-4 text-primary" />
                    <span className="font-bold">{brandItem.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productList?.map((product) => (
                <ShoppingProductTile
                  key={product._id}
                  product={product}
                  onClick={() => handleGetProductDetails(product._id)}
                  onAddToCart={() => handleAddtoCart(product._id)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
      {openDetailsDialog && <ProductDetailsDialog />}

    </>
  );
}

export default ShoppingHome;
