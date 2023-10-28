import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

function MenuReservationApp() {
  const [menuItems, setMenuItems] = useState([
    { id: 1, category: 'Appetizers', name: 'Salad', price: 6, quantity: 0, ingredients: 'Lettuce, Tomatoes, Cucumbers, Dressing', discount: 10 },
    { id: 2, category: 'Appetizers', name: 'Mozzarella Sticks', price: 8, quantity: 0, ingredients: 'Mozzarella Cheese, Breadcrumbs, Marinara Sauce', discount: 15 },
    { id: 3, category: 'Appetizers', name: 'Bruschetta', price: 7, quantity: 0, ingredients: 'Chopped Tomatoes, Basil, Garlic sauce, Olive Oil', discount: 5 },
    { id: 4, category: 'Main Course', name: 'Burger', price: 10, quantity: 0, ingredients: 'Beef Patty, Lettuce, Tomato, Cheese, Bun', discount: 20 },
    { id: 5, category: 'Main Course', name: 'Pizza', price: 12, quantity: 0, ingredients: 'Tomato Sauce, Cheese, Pepperoni, Dough', discount: 25 },
    { id: 6, category: 'Main Course', name: 'Pasta', price: 8, quantity: 0, ingredients: 'Pasta, Marinara Sauce, Parmesan Cheese', discount: 10 },
    { id: 7, category: 'Desserts', name: 'Cheesecake', price: 5, quantity: 0, ingredients: 'Cream Cheese, Sugar', discount: 15 },
    { id: 8, category: 'Desserts', name: 'Chocolate Cake', price: 6, quantity: 0, ingredients: 'Chocolate, Flour, Sugar, Eggs', discount: 30 },
    { id: 9, category: 'Desserts', name: 'Ice Cream', price: 4, quantity: 0, ingredients: 'Milk, Sugar, Cream', discount: 5 },
  ]);

  const handleQuantityChange = (itemId, quantity) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const handleAddToCart = () => {
    const selectedItems = menuItems.filter((item) => item.quantity > 0);
    console.log('Selected items:', selectedItems);
    // Implement your logic to submit the reservation here
  };

  // Group menu items by category
  const categories = [...new Set(menuItems.map((item) => item.category))];

  return (
    <Container className="mt-5">
      <h1 className="text-center">Restaurant Menu</h1>
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-center">{category}</h2>
          <Row>
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <Col key={item.id} md={4} className="mb-4">
                  <Card>
                    <Card.Body>
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">${item.price}</p>
                      <p className="card-text">Ingredients: {item.ingredients}</p>
                      <p className="card-text">Discount: {item.discount}% off</p>
                      <div className="text-center">
                        <Button
                          variant="danger"
                          className="mr-2"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="success"
                          className="ml-2"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </div>
      ))}
      <div className="text-center mt-4">
        <Button variant="primary" size="lg" onClick={handleAddToCart}>
          Submit Reservation
        </Button>
      </div>
    </Container>
  );
}

export default MenuReservationApp;
