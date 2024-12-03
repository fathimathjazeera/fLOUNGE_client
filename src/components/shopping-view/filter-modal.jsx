import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ListFilter } from 'lucide-react';

function ProductFilterModal({ filters, handleFilter }) {
  const [open, setOpen] = useState(false);  // State to control modal visibility
  const categories = ['men', 'women', 'kids', 'accessories', 'footwear'];
  const brands = ['nike', 'adidas', 'puma', "levi's", 'zara', 'H&M'];

  function handleCheckboxChange(section, value) {
    handleFilter(section, value);  // Update filters when checkbox changes
  }

  function handleApply() {
    setOpen(false); // Close the modal when 'Apply' is clicked
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>  {/* Bind open/close state to the modal */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden ml-36">
          <ListFilter height={20} />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
          <DialogClose onClick={() => setOpen(false)} />  {/* Close modal when DialogClose is clicked */}
        </DialogHeader>

        <div className="space-y-2">
          <h4 className="font-bold">Categories</h4>
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={category}
                checked={filters?.category?.includes(category) || false}
                onChange={() => handleCheckboxChange('category', category)}
              />
              <label htmlFor={category}>{category}</label>
            </div>
          ))}
        </div>

        <div className="space-y-2 mt-4">
          <h4 className="font-bold">Brands</h4>
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={brand}
                checked={filters?.brand?.includes(brand) || false}
                onChange={() => handleCheckboxChange('brand', brand)}
              />
              <label htmlFor={brand}>{brand}</label>
            </div>
          ))}
          <Button className="w-full text-sm mt-5 p-5" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductFilterModal;
