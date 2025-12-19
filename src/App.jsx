import "./App.css";
import Home from "./screens/home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router";
import Shop from "./screens/commerce/shop";
import SingleProduct from "./screens/commerce/singleproduct";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<SingleProduct />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
