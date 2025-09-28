import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Order, OrderItem, CreateOrderRequest } from '../types';
import { api } from '../services/api';

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
}

function OrderForm({ onOrderCreated }: OrderFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
  });
  
  const [items, setItems] = useState<OrderItem[]>([
    { productId: '', productName: '', quantity: 1, price: 0 }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { productId: '', productName: '', quantity: 1, price: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail) {
      toast.error('Please fill in customer details');
      return;
    }
    
    if (items.some(item => !item.productName || !item.productId || item.quantity <= 0 || item.price <= 0)) {
      toast.error('Please fill in all item details with valid values');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderRequest: CreateOrderRequest = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        items: items,
        totalAmount: calculateTotal()
      };

      const newOrder = await api.createOrder(orderRequest);
      
      // Reset form
      setFormData({ customerName: '', customerEmail: '' });
      setItems([{ productId: '', productName: '', quantity: 1, price: 0 }]);
      
      onOrderCreated(newOrder);
      toast.success('Order created successfully!');
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px', color: '#333' }}>Create New Order</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Customer Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="Enter customer name"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Customer Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            placeholder="Enter customer email"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Items</label>
          {items.map((item, index) => (
            <div key={index} style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '6px', 
              padding: '16px', 
              marginBottom: '12px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Product ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                    placeholder="Product ID"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.productName}
                    onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                    placeholder="Product name"
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  style={{
                    padding: '8px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: items.length === 1 ? '#ccc' : '#dc3545',
                    color: 'white',
                    cursor: items.length === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addItem}
            className="btn btn-secondary"
            style={{ marginBottom: '16px' }}
          >
            Add Item
          </button>
        </div>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f0f8ff', 
          borderRadius: '6px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Total Amount: ${calculateTotal().toFixed(2)}</strong>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          style={{ width: '100%' }}
        >
          {isSubmitting ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm; 