import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService, LanguageService } from '@org/shared';

type PortalPage = 'auth' | 'dashboard' | 'categories' | 'cart' | 'checkout';

interface MenuItem {
  nameFa: string;
  nameEn: string;
  category: 'coffee' | 'breakfast' | 'mains' | 'dessert';
  descriptionFa: string;
  descriptionEn: string;
  price: number;
  image: string;
  badgeFa?: string;
  badgeEn?: string;
}

@Component({
  imports: [FormsModule, RouterModule],
  selector: 'app-customer-portal',
  templateUrl: './customer-portal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerPortal {
  private readonly router = inject(Router);
  protected readonly locale = inject(LanguageService);
  protected readonly cart = inject(CartService);
  protected readonly page = inject(ActivatedRoute).snapshot.data['page'] as PortalPage;
  protected authMode: 'signin' | 'signup' = 'signin';
  protected selectedCategory = 'all';
  protected searchTerm = '';
  protected fullName = '';
  protected email = '';
  protected password = '';
  protected displayName = 'سارا';
  protected notice = '';
  protected customerName = '';
  protected customerPhone = '';
  protected customerAddress = '';

  protected readonly categories = ['all', 'coffee', 'breakfast', 'mains', 'dessert'];

  private readonly copy: Record<string, [string, string]> = {
    authPhotoEyebrow: ['یک مکث خوش‌طعم', 'A little pause, full of flavor'],
    authHeroLine1: ['قهوه‌ات را پیدا کن.', 'Find your coffee.'],
    authHeroLine2: ['حال خوبت را سفارش بده.', 'Order your happy place.'],
    authHeroDesc: ['از صبحانه‌های آرام تا قهوه‌های عصرگاهی، همه‌چیز تازه و با حوصله آماده می‌شود.', 'From slow breakfasts to afternoon coffee, everything is freshly and thoughtfully prepared.'],
    photoCredit: ['از دل آشپزخانه نون و نمک', 'From the Noon & Namak kitchen'],
    welcomeBack: ['خوش برگشتی', 'Welcome back'],
    signinTitle: ['ورود به حساب', 'Sign in to your account'],
    signupTitle: ['ساختن حساب', 'Create your account'],
    signinDesc: ['برای دیدن سفارش‌ها و پیشنهادهای مخصوصت وارد شو.', 'Sign in to see your orders and personal recommendations.'],
    signupDesc: ['به جمع دوست‌داران طعم‌های خوب بپیوند.', 'Join our community of good-food lovers.'],
    authTabs: ['انتخاب ورود یا ثبت‌نام', 'Choose sign in or sign up'],
    signin: ['ورود', 'Sign in'],
    signup: ['ثبت‌نام', 'Sign up'],
    fullName: ['نام و نام خانوادگی', 'Full name'],
    namePlaceholder: ['مثلاً سارا احمدی', 'e.g. Sara Ahmadi'],
    email: ['ایمیل یا شماره موبایل', 'Email or mobile number'],
    emailPlaceholder: ['۰۹۱۲۱۲۳۴۵۶۷', 'name@example.com'],
    password: ['رمز عبور', 'Password'],
    passwordPlaceholder: ['حداقل ۸ کاراکتر', 'At least 8 characters'],
    forgot: ['رمز عبورت را فراموش کردی؟', 'Forgot your password?'],
    submitSignin: ['ورود به حساب', 'Sign in'],
    submitSignup: ['ساخت حساب کاربری', 'Create account'],
    termsLead: ['با ادامه،', 'By continuing, you agree to our'],
    terms: ['قوانین استفاده', 'Terms of service'],
    privacy: ['و حریم خصوصی کافه را می‌پذیری.', 'and cafe privacy policy.'],
    or: ['یا', 'or'],
    guest: ['ادامه به‌عنوان مهمان', 'Continue as guest'],
    dayAhead: ['یک روز خوشمزه در راه است', 'A delicious day is ahead'],
    hello: ['سلام', 'Hello'],
    welcome: ['خوش اومدی', 'welcome back'],
    dashboardQuestion: ['برای امروز چه چیزی حالتو خوب می‌کنه؟', 'What would make your day today?'],
    newOrder: ['سفارش تازه', 'Start an order'],
    chefPick: ['پیشنهاد امروز سرآشپز', "Today's chef's pick"],
    calmBreakfast: ['صبحانه‌ای برای', 'A breakfast for'],
    calmStart: ['شروعی آرام', 'a slower morning'],
    breakfastDescription: ['املت تنوری، نان تازه و یک فنجان قهوه دمی؛ یک ترکیب دوست‌داشتنی برای صبح امروز.', 'Oven-baked omelet, fresh bread, and a cup of pour-over coffee. A lovely way to start today.'],
    seePicks: ['دیدن پیشنهادها', 'See recommendations'],
    fresh: ['تازه', 'Fresh'],
    everyDay: ['هر روز', 'Every day'],
    withLove: ['با عشق', 'With love'],
    accountSummary: ['خلاصه حساب', 'Account summary'],
    orderCount: ['سفارش تا امروز', 'Orders to date'],
    loyalty: ['امتیاز وفاداری', 'Loyalty points'],
    savedAddress: ['آدرس منتخب', 'Saved address'],
    tehran: ['تهران، ونک', 'Vanak, Tehran'],
    deliveryTime: ['میانگین تحویل', 'Average delivery'],
    minutes: ['۴۵ دقیقه', '45 min'],
    pastOrders: ['از تجربه‌های قبلی‌ات', 'From your past visits'],
    recentOrders: ['سفارش‌های اخیر', 'Recent orders'],
    allOrders: ['همه سفارش‌ها', 'All orders'],
    delivered: ['تحویل شده', 'Delivered'],
    reorder: ['سفارش دوباره', 'Order again'],
    firstOrder: ['لاته عسل و دارچین، کروسان کره‌ای', 'Honey cinnamon latte, butter croissant'],
    secondOrder: ['پاستا آلفردو، آیس آمریکانو', 'Alfredo pasta, iced Americano'],
    orderDateOne: ['۲۴ مهر ۱۴۰۵ · سفارش شماره ۴۸۲۱', 'Oct 16, 2026 · Order #4821'],
    orderDateTwo: ['۱۹ مهر ۱۴۰۵ · سفارش شماره ۴۷۶۰', 'Oct 11, 2026 · Order #4760'],
    bestsellerEyebrow: ['انتخاب‌های محبوب', 'Guest favorites'],
    bestsellers: ['پرفروش‌های کافه', 'Cafe bestsellers'],
    viewMenu: ['مشاهده منو', 'View menu'],
    popular: ['محبوب', 'Popular'],
    newestEyebrow: ['تازه از آشپزخانه', 'Fresh from the kitchen'],
    newestMenu: ['جدیدترین‌های منو', 'New on the menu'],
    allNew: ['همه‌ی تازه‌ها', 'See all new items'],
    categoryEyebrow: ['منوی کافه', 'Cafe menu'],
    craving: ['چی میل داری؟', 'What are you craving?'],
    categoryDescription: ['از قهوه‌ی تازه تا یک دسر کوچک برای شیرین‌تر شدن روزت.', 'From fresh coffee to a little dessert to sweeten your day.'],
    search: ['جست‌وجو در منو', 'Search the menu'],
    categoryFilters: ['فیلتر دسته‌بندی منو', 'Filter menu categories'],
    weeklyOffer: ['پیشنهاد ویژه این هفته', "This week's special"],
    sweeter: ['لحظه‌ای شیرین‌تر', 'Make it a little sweeter'],
    offerDescription: ['با سفارش هر نوشیدنی گرم، یک شیرینی روز مهمان ما باش.', 'Order any hot drink and enjoy a pastry of the day on us.'],
    readyFresh: ['آماده‌شده با مواد تازه', 'Made with fresh ingredients'],
    allDelights: ['همه‌ی خوشمزه‌ها', 'All the good stuff'],
    choices: ['انتخاب', 'items'],
    addToCart: ['افزودن', 'Add'],
    emptySearch: ['چیزی با این مشخصات پیدا نکردیم. عبارت دیگری را امتحان کن.', 'No matches found. Try another search.'],
    cart: ['سبد خرید', 'Cart'],
    item: ['قلم', 'items'],
    currency: ['تومان', 'Toman'],
    itemAdded: ['به سبد اضافه شد', 'added to your cart'],
    categoryAll: ['همه', 'All'],
    categoryCoffee: ['قهوه', 'Coffee'],
    categoryBreakfast: ['صبحانه', 'Breakfast'],
    categoryMains: ['غذای اصلی', 'Mains'],
    categoryDessert: ['دسر', 'Desserts'],
    latte: ['لاته عسل و دارچین', 'Honey Cinnamon Latte'],
    latteDescription: ['اسپرسو دوبل، شیر تازه و عسل طبیعی', 'Double espresso, steamed milk, and local honey'],
    bestseller: ['پرفروش', 'Bestseller'],
    pancake: ['پنکیک توت‌فرنگی', 'Strawberry Pancakes'],
    pancakeDescription: ['پنکیک گرم با میوه فصل و شیره افرا', 'Warm pancakes with seasonal berries and maple syrup'],
    pasta: ['پاستا آلفردو', 'Alfredo Pasta'],
    pastaDescription: ['سس خامه‌ای، قارچ و پنیر پارمزان', 'Cream sauce, mushrooms, and Parmesan'],
    cheesecake: ['چیزکیک سن‌سباستین', 'Basque Cheesecake'],
    cheesecakeDescription: ['چیزکیک دست‌ساز با بافت لطیف وانیلی', 'Handmade cheesecake with a delicate vanilla center'],
    icedAmericano: ['آیس آمریکانو', 'Iced Americano'],
    icedAmericanoDescription: ['اسپرسو تازه با آب خنک و یخ شفاف', 'Fresh espresso, chilled water, and clear ice'],
    omelet: ['املت گوجه تنوری', 'Roasted Tomato Omelet'],
    omeletDescription: ['تخم‌مرغ محلی، گوجه تنوری و نان داغ', 'Farm eggs, roasted tomatoes, and warm bread'],
    cartTitle: ['سبد خرید', 'Your cart'],
    cartDescription: ['انتخاب‌های خوشمزه‌ات را مرور کن.', 'Review your cafe favorites before checkout.'],
    emptyCart: ['سبدت هنوز خالی است.', 'Your cart is waiting for something delicious.'],
    browseMenu: ['رفتن به منو', 'Browse the menu'],
    quantity: ['تعداد', 'Quantity'],
    remove: ['حذف', 'Remove'],
    subtotal: ['جمع سفارش', 'Subtotal'],
    deliveryFee: ['هزینه ارسال', 'Delivery'],
    free: ['رایگان', 'Free'],
    total: ['مبلغ نهایی', 'Total'],
    continueCheckout: ['ادامه و ثبت سفارش', 'Continue to checkout'],
    checkoutTitle: ['ثبت سفارش', 'Checkout'],
    checkoutDescription: ['اطلاعات تحویل سفارش را وارد کن.', 'Where should we deliver your order?'],
    customerName: ['نام و نام خانوادگی', 'Full name'],
    customerPhone: ['شماره تماس', 'Phone number'],
    address: ['آدرس تحویل', 'Delivery address'],
    addressPlaceholder: ['خیابان، کوچه، پلاک و واحد', 'Street, building and unit'],
    submitOrder: ['ثبت نهایی سفارش', 'Place order'],
    orderReceived: ['سفارشت ثبت شد!', 'Your order is in!'],
    orderReceivedDescription: ['کافه سفارش را دریافت کرده و به‌زودی آماده‌سازی را شروع می‌کند.', 'The cafe received your order and will start preparing it shortly.'],
    orderNumber: ['شماره سفارش', 'Order number'],
    backToHome: ['بازگشت به خانه', 'Back to home'],
    checkoutRequired: ['برای ثبت سفارش، سبد خریدت را پر کن.', 'Add an item to your cart before checking out.'],
  };

  protected readonly menuItems: MenuItem[] = [
    {
      nameFa: 'لاته عسل و دارچین',
      nameEn: 'Honey Cinnamon Latte',
      category: 'coffee',
      descriptionFa: 'اسپرسو دوبل، شیر تازه و عسل طبیعی',
      descriptionEn: 'Double espresso, steamed milk, and local honey',
      price: 148000,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=85',
      badgeFa: 'پرفروش',
      badgeEn: 'Bestseller',
    },
    {
      nameFa: 'پنکیک توت‌فرنگی',
      nameEn: 'Strawberry Pancakes',
      category: 'breakfast',
      descriptionFa: 'پنکیک گرم با میوه فصل و شیره افرا',
      descriptionEn: 'Warm pancakes with seasonal berries and maple syrup',
      price: 225000,
      image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=700&q=85',
      badgeFa: 'تازه',
      badgeEn: 'New',
    },
    {
      nameFa: 'پاستا آلفردو',
      nameEn: 'Alfredo Pasta',
      category: 'mains',
      descriptionFa: 'سس خامه‌ای، قارچ و پنیر پارمزان',
      descriptionEn: 'Cream sauce, mushrooms, and Parmesan',
      price: 328000,
      image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=85',
    },
    {
      nameFa: 'چیزکیک سن‌سباستین',
      nameEn: 'Basque Cheesecake',
      category: 'dessert',
      descriptionFa: 'چیزکیک دست‌ساز با بافت لطیف وانیلی',
      descriptionEn: 'Handmade cheesecake with a delicate vanilla center',
      price: 172000,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=85',
      badgeFa: 'تازه',
      badgeEn: 'New',
    },
    {
      nameFa: 'آیس آمریکانو',
      nameEn: 'Iced Americano',
      category: 'coffee',
      descriptionFa: 'اسپرسو تازه با آب خنک و یخ شفاف',
      descriptionEn: 'Fresh espresso, chilled water, and clear ice',
      price: 112000,
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=85',
    },
    {
      nameFa: 'املت گوجه تنوری',
      nameEn: 'Roasted Tomato Omelet',
      category: 'breakfast',
      descriptionFa: 'تخم‌مرغ محلی، گوجه تنوری و نان داغ',
      descriptionEn: 'Farm eggs, roasted tomatoes, and warm bread',
      price: 198000,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=85',
    },
  ];

  protected t(key: string): string {
    const values = this.copy[key] ?? [key, key];
    return values[this.locale.language() === 'fa' ? 0 : 1];
  }

  protected itemName(item: MenuItem): string {
    return this.locale.language() === 'fa' ? item.nameFa : item.nameEn;
  }

  protected itemDescription(item: MenuItem): string {
    return this.locale.language() === 'fa' ? item.descriptionFa : item.descriptionEn;
  }

  protected itemBadge(item: MenuItem): string {
    return this.locale.language() === 'fa' ? item.badgeFa ?? this.t('popular') : item.badgeEn ?? this.t('popular');
  }

  protected categoryLabel(category: string): string {
    const keys: Record<string, string> = {
      all: 'categoryAll', coffee: 'categoryCoffee', breakfast: 'categoryBreakfast',
      mains: 'categoryMains', dessert: 'categoryDessert',
    };
    return this.t(keys[category] ?? category);
  }

  protected get filteredItems(): MenuItem[] {
    const language = this.locale.language();
    const query = this.searchTerm.trim().toLocaleLowerCase(language === 'fa' ? 'fa' : 'en');
    return this.menuItems.filter(item => {
      const matchesCategory = this.selectedCategory === 'all' || item.category === this.selectedCategory;
      const searchableText = language === 'fa'
        ? `${item.nameFa} ${item.descriptionFa}`
        : `${item.nameEn} ${item.descriptionEn}`;
      const matchesSearch = !query || searchableText.toLocaleLowerCase(language === 'fa' ? 'fa' : 'en').includes(query);
      return matchesCategory && matchesSearch;
    });
  }

  protected get displayNameLabel(): string {
    if (this.displayName === 'سارا' || this.displayName === 'Sara') {
      return this.locale.language() === 'fa' ? 'سارا' : 'Sara';
    }
    return this.displayName;
  }

  protected setAuthMode(mode: 'signin' | 'signup'): void {
    this.authMode = mode;
  }

  protected submitAuth(): void {
    this.displayName = this.authMode === 'signup' && this.fullName.trim()
      ? this.fullName.trim().split(/\s+/)[0]
      : this.locale.language() === 'fa' ? 'سارا' : 'Sara';
    void this.router.navigateByUrl('/dashboard');
  }

  protected addToCart(item: MenuItem): void {
    this.cart.add({
      id: item.nameEn,
      nameFa: item.nameFa,
      nameEn: item.nameEn,
      price: item.price,
      image: item.image,
    });
    this.notice = `${this.itemName(item)} ${this.t('itemAdded')}`;
    setTimeout(() => (this.notice = ''), 2400);
  }

  protected imageUnavailable(event: Event): void {
    const image = event.target;
    if (image instanceof HTMLImageElement) {
      image.closest('.menu-image')?.classList.add('image-unavailable');
    }
  }

  protected selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  protected cartName(nameFa: string, nameEn: string): string {
    return this.locale.language() === 'fa' ? nameFa : nameEn;
  }

  protected updateCartQuantity(id: string, quantity: number): void {
    this.cart.setQuantity(id, quantity);
  }

  protected removeFromCart(id: string): void {
    this.cart.remove(id);
  }

  protected submitOrder(): void {
    const order = this.cart.placeOrder(this.customerName, this.customerPhone, this.customerAddress);
    if (!order) {
      this.notice = this.t('checkoutRequired');
      setTimeout(() => (this.notice = ''), 2400);
    }
  }

  protected formatPrice(price: number): string {
    return new Intl.NumberFormat(this.locale.language() === 'fa' ? 'fa-IR' : 'en-US').format(price);
  }
}