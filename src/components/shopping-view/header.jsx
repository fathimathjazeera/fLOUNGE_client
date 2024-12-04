import { Filter, House, LogOut, Menu, ShoppingCart, UserCog } from 'lucide-react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { shoppingViewHeaderMenuItems } from '@/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { logoutUser } from '@/store/auth-slice';
import UserCartWrapper from './cart-wrapper';
import { useEffect, useState } from 'react';
import { fetchCartItems } from '@/store/shop/cart-slice';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import ProductFilterModal from './filter-modal';

function MenuItems({ closeSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem('filters');
    const currentFilter =
      getCurrentMenuItem.id !== 'home' &&
      getCurrentMenuItem.id !== 'products' &&
      getCurrentMenuItem.id !== 'search'
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem('filters', JSON.stringify(currentFilter));
    location.pathname.includes('listing') && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
      if (closeSidebar) {
        closeSidebar();
      }
  }


  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer"
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}


function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }


  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);
  


  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
            {cartItems?.items?.length || 0}
          </span>
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
        />
      </Sheet>
      {!user ? (
        <Button
          onClick={() => {
            navigate('/auth/login');
          }}
        >
          Login
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="bg-black">
              <AvatarFallback className="bg-black text-white font-extrabold">
                {user?.userName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/shop/account')}>
              <UserCog className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}



function ShoppingHeader() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const isListingPage = location.pathname.includes("listing");
 // Define the filters state
 const [filters, setFilters] = useState({
  category: [],
  brand: [],
});

// Handle filter changes
const handleFilter = (section, value) => {
  setFilters((prevFilters) => {
    const newFilters = { ...prevFilters };
    if (newFilters[section].includes(value)) {
      newFilters[section] = newFilters[section].filter((item) => item !== value);
    } else {
      newFilters[section].push(value);
    }
    return newFilters;
  });
};
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <House className="h-6 w-6" />
          <span className="font-bold">fLOUNGE</span>
        </Link>
        {isListingPage && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-6 w-6" />
                <span className="sr-only">Filter</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
            <ProductFilterModal  filters={filters} handleFilter={handleFilter} />
            </DialogContent>
          </Dialog>
        )}

        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems closeSidebar={() => setIsSidebarOpen(false)} />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;