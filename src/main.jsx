import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import { UserProvider } from './contexts/UserContext.jsx';
import { ProviderProvider } from './contexts/ProviderContext.jsx';
import { ProductProvider } from './contexts/ProductContext.jsx';
import { OrderProvider } from './contexts/OrderContext.jsx';
import { SaleProvider } from './contexts/SaleContext.jsx'; // New import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ProviderProvider>
          <ProductProvider>
            <OrderProvider>
              <SaleProvider> {/* New Provider */}
                <App />
              </SaleProvider>
            </OrderProvider>
          </ProductProvider>
        </ProviderProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
