import "./App.css";
import Home from "./screens/home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Route, Routes } from "react-router";
import Shop from "./screens/commerce/shop";
import SingleProduct from "./screens/commerce/singleproduct";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#fefefe',
            color: '#000',
            padding: '12px',
            borderRadius: '1px',
            fontSize: '12px',
          },
          iconTheme:{
            primary: '#fff',
            secondary: '#000',
          }
        }}
      />
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
