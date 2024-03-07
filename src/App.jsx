import React from "react";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";
import Confetti from "react-confetti";
import FuzzySearch from "react-fuzzy";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const shops = [
  { id: 1, name: "Migros" },
  { id: 2, name: "Bim" },
  { id: 3, name: "Toyzz Shop" },
];

const categories = [
  { id: 1, name: "Electronic" },
  { id: 2, name: "Toy" },
  { id: 3, name: "Delicatessen" },
];

const IconButton = ({ icon }) => (
  <button type="button" onClick={() => alert("Ürün silindi!")}>
    {icon}
  </button>
);

function App() {
  const [productInput, setProductInput] = useState("");
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [confettiVisible, setConfettiVisible] = useState(false);

  const [filteredShopId, setFilteredShopId] = useState("");
  const [filteredCategoryId, setFilteredCategoryId] = useState("");
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [filteredName, setFilteredName] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const addProducts = () => {
    if (!productInput || !selectedShop || !selectedCategory) {
      alert("Please select product name, market and category.");
      return;
    }
    const newProduct = {
      id: nanoid(),
      name: productInput,
      shop: parseInt(selectedShop),
      category: parseInt(selectedCategory),
      isBought: false,
    };

    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts, newProduct];

      const allItemsBought = updatedProducts.every((item) => item.isBought);
      if (allItemsBought && updatedProducts.length > 0) {
        setConfettiVisible(true);
      }

      return updatedProducts;
    });

    setProductInput("");
  };

  useEffect(() => {
    const allItemsBought = products.every((item) => item.isBought);
    if (allItemsBought && products.length > 0) {
      setConfettiVisible(true);
    } else {
      setConfettiVisible(false);
    }
  }, [products]);

  const handleBuy = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id
          ? { ...product, isBought: !product.isBought }
          : product
      )
    );
    setShowAlert(true);
  };

  const handleDelete = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    setFilteredProducts((prevFilteredProducts) =>
      prevFilteredProducts.filter((product) => product.id !== id)
    );
  };

  useEffect(() => {
    const allItemsBought = products.every((item) => item.isBought);

    if (allItemsBought && products.length > 0) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [products]);

  const handleFilterChange = (result) => {
    setFilteredProducts(result);
  };

  const startFiltering = () => {
    const filtered = products.filter((product) => {
      const isShopMatch =
        filteredShopId === "" || product.shop === parseInt(filteredShopId);
      const isCategoryMatch =
        filteredCategoryId === "" ||
        product.category === parseInt(filteredCategoryId);
      const isStatusMatch =
        filteredStatus === "all" ||
        (filteredStatus === "bought" && product.isBought) ||
        (filteredStatus === "notBought" && !product.isBought);
      const isProductNameMatch =
        !filteredName ||
        product.name.toLowerCase().includes(filteredName.toLowerCase());

      return (
        isShopMatch && isCategoryMatch && isStatusMatch && isProductNameMatch
      );
    });

    setFilteredProducts(filtered);
  };

  return (
    <div className="container">
      <Form>
        <Form.Group>
          <Form.Label className="label-head" htmlFor="products">
            Shopping List
          </Form.Label>
          <Form.Control
            placeholder="Enter product name"
            id="products"
            type="text"
            className="input"
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
          />
        </Form.Group>

        <Form.Select
          onChange={(e) => setSelectedShop(e.target.value)}
          value={selectedShop}
          className="form-select"
        >
          <option>Select Supermarket</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </Form.Select>
        <Form.Select
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
          className="form-select"
        >
          <option>Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Form.Select>

        <button className="button m-3 px-5" onClick={addProducts} type="button">
          Add Product
        </button>
      </Form>

      {showAlert && (
        <Alert
          variant="success"
          onClose={() => setShowAlert(false)}
          dismissible
        >
          Shopping Completed!
        </Alert>
      )}
      {confettiVisible && <Confetti />}

      <Table className="table-container">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Market</th>
            <th>Category</th>
            <th>Situation</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              style={{
                textDecoration: product.isBought ? "line-through" : "none",
              }}
            >
              <td>{product.name}</td>
              <td>{shops.find((shop) => shop.id === product.shop)?.name}</td>
              <td>
                {
                  categories.find(
                    (category) => category.id === product.category
                  )?.name
                }
              </td>
              <td onClick={() => handleBuy(product.id)}>
                {product.isBought ? "Bought" : "Buy"}
              </td>
              <td onClick={() => handleDelete(product.id)}>
                <IconButton icon="✖️" />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <hr />

      <div>
        <h1 className="label-head">Filter Products</h1>

        <FuzzySearch
          className={"mx-auto"}
          list={products}
          keys={["name", "shop", "category"]}
          onChange={handleFilterChange}
          resultsTemplate={(props, state, styles) => {
            return state.results.map((val, i) => (
              <div key={i} style={styles.results}>
                {val.name}
              </div>
            ));
          }}
        />
      </div>
      <div className="my-2">
        <select
          onChange={(e) => setFilteredShopId(e.target.value)}
          value={filteredShopId}
        >
          <option value="">Market</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setFilteredCategoryId(e.target.value)}
          value={filteredCategoryId}
        >
          <option value="">Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="my-2">
          <input
            type="radio"
            value="all"
            checked={filteredStatus === "all"}
            onChange={() => setFilteredStatus("all")}
          />{" "}
          All
          <input
            type="radio"
            value="bought"
            checked={filteredStatus === "bought"}
            onChange={() => setFilteredStatus("bought")}
          />{" "}
          Purchases
          <input
            type="radio"
            value="notBought"
            checked={filteredStatus === "notBought"}
            onChange={() => setFilteredStatus("notBought")}
          />{" "}
          Not Purchased
        </div>
        <button
          className="button m-3 px-5"
          onClick={startFiltering}
          type="button"
        >
          Add Filter Products
        </button>
      </div>

      <Table className="table-container">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Market</th>
            <th>Category</th>
            <th>Situation</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr
              key={product.id}
              style={{
                textDecoration: product.isBought ? "line-through" : "none",
              }}
            >
              <td>{product.name}</td>
              <td>{shops.find((shop) => shop.id === product.shop)?.name}</td>
              <td>
                {
                  categories.find(
                    (category) => category.id === product.category
                  )?.name
                }
              </td>
              <td onClick={() => handleBuy(product.id)}>
                {product.isBought ? "Bought" : "Buy"}
              </td>
              <td onClick={() => handleDelete(product.id)}>
                <IconButton icon="✖️" />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default App;
