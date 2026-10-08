import { Routes } from '@angular/router';
import { HomeComponent } from './layout/pages/home/home.component';
import { LoginComponent } from './layout/pages/login/login.component';
import { RegisterComponent } from './layout/pages/register/register.component';
import { CartComponent } from './layout/pages/cart/cart.component';
import { NotfoundComponent } from './layout/additions/notfound/notfound.component';
import { ProductDetailsComponent } from './layout/additions/product-details/product-details.component';
import { ProductComponent } from './layout/pages/products/products.component';
import { CheckoutComponent } from './layout/pages/checkout/checkout.component';
import { CheckoutDetailsComponent } from './layout/pages/checkoutdetails/checkoutdetails.component';
import { Checkout3Component } from './layout/pages/checkout3/checkout3.component';
import { authGuard } from './core/guards/auth.guard';
import { ContactusComponent } from './layout/pages/contactus/contactus.component';
import { AboutusComponent } from './layout/pages/aboutus/aboutus.component';
import { PrivacyPolicyComponent } from './layout/pages/privacy-policy/privacy-policy.component';
import { TermsComponent } from './layout/pages/terms/terms.component';
import { FaqComponent } from './layout/pages/faq/faq.component';
import { OrderSuccessComponent } from './layout/pages/order-success/order-success.component';
import { OrdersComponent } from './layout/pages/orders/orders.component';
import { WishlistComponent } from './layout/pages/wishlist/wishlist.component';
import { ProfileComponent } from './layout/pages/profile/profile.component';
import { OrderDetailsComponent } from './layout/pages/order-details/order-details.component';

export const routes: Routes = [
    {path: '' , redirectTo : 'home' , pathMatch : 'full'  },
    {path : 'home' , component : HomeComponent},
    {path : 'login' , component : LoginComponent},
    {path : 'register' , component : RegisterComponent},
    // {path : 'cart' , component : CartComponent},
    {path : 'products' , component : ProductComponent},
    {path : 'product-details' , component : ProductDetailsComponent},
    {path : 'products/:id' , component : ProductDetailsComponent},
    {path : 'home' , component : HomeComponent},
        {path : 'contactus' , component : ContactusComponent },
        {path : 'aboutus' , component : AboutusComponent },
        {path : 'privacy-policy' , component : PrivacyPolicyComponent },
        {path : 'Terms & Condition' , component : TermsComponent },
        {path : 'faq' , component : FaqComponent },
        {path : 'order-success' , component : OrderSuccessComponent },
        {path : 'orders' , component : OrdersComponent },
        {path : 'profile', component : ProfileComponent},
    // {path : 'checkout' , component : CheckoutComponent},
    // {path : 'checkoutdetails' , component : CheckoutDetailsComponent},
    // {path : 'checkout3' , component : Checkout3Component},
    // {path : '**' , component : NotfoundComponent},


{
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  {
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [authGuard]
  },
  {
    path: 'checkoutdetails',
    component: CheckoutDetailsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'checkout3',
    component: Checkout3Component,
    canActivate: [authGuard]
  },
  {
    path: 'orderdetails/:id',
    component: OrderDetailsComponent,
    canActivate: [authGuard]
  },

  // لازم يكون آخر Route
  {
    path: '**',
    component: NotfoundComponent
  }
];