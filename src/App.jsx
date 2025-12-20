import "./App.css";
import Home from "./screens/home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Route, Routes } from "react-router";
import Shop from "./screens/commerce/shop";
import SingleProduct from "./screens/commerce/singleproduct";

function App() {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product-category/:slug" element={<Shop />} />
        <Route path="/product/:slug" element={<SingleProduct />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
