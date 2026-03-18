import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../providers/cart_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/category.dart';
import '../../models/product.dart';
import '../../core/api_client.dart';
import '../../core/app_colors.dart';
import 'product_details_screen.dart';
import 'login_screen.dart';
import 'admin_dashboard_screen.dart';
import 'delivery_dashboard_screen.dart';
import 'category_products_screen.dart';
import 'cart_screen.dart';
import 'profile_screen.dart';
import 'notification_screen.dart';
import 'categories_screen.dart';
import 'orders_screen.dart';
import 'wishlist_screen.dart';
import 'chat_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final ScrollController _sidebarController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  int _selectedIndex = 0; // Added this line

  @override
  void dispose() {
    _searchController.dispose();
    _sidebarController.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final productProvider = Provider.of<ProductProvider>(context);
    final cart = Provider.of<CartProvider>(context);
    final auth = Provider.of<AuthProvider>(context);
    
    final List<Widget> _pages = [
      _buildHomeContent(productProvider, cart, auth),
      const CategoriesScreen(),
      const CartScreen(),
      const OrdersScreen(showAppBar: true),
      const ProfileScreen(),
    ];

    return Scaffold(
      key: _scaffoldKey,
      floatingActionButton: _selectedIndex == 0 ? FloatingActionButton(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChatScreen())),
        backgroundColor: const Color(0xFFF97316),
        shape: const CircleBorder(),
        child: const Icon(Icons.chat_bubble_outline, color: Colors.white),
      ) : null,
      drawer: _buildSidebar(),
      bottomNavigationBar: BottomNavigationBar( 
        currentIndex: _selectedIndex >= 5 ? 0 : _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.orange,
        unselectedItemColor: AppColors.slate500,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
        unselectedLabelStyle: const TextStyle(fontSize: 12),
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          const BottomNavigationBarItem(icon: Icon(Icons.grid_view), activeIcon: Icon(Icons.grid_view_sharp), label: 'Categories'),
          BottomNavigationBarItem(
            icon: Badge(
              label: Text(cart.totalItems.toString()),
              isLabelVisible: cart.totalItems > 0,
              child: const Icon(Icons.shopping_bag_outlined),
            ), 
            label: 'Cart'
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), label: 'Orders'),
          const BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Account'),
        ],
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: _pages,
      ),
    );
  }

  Widget _buildHomeContent(ProductProvider productProvider, CartProvider cart, AuthProvider auth) {
    return RefreshIndicator(
        onRefresh: () => productProvider.fetchHomeData(),
        child: productProvider.isLoading 
          ? const Center(child: CircularProgressIndicator(color: Colors.orange))
            : CustomScrollView(
              controller: _sidebarController,
              slivers: [
                _buildAppBar(),
                _buildSearchBar(),
                if (productProvider.searchResults.isNotEmpty)
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.7,
                        mainAxisSpacing: 10,
                        crossAxisSpacing: 10,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) => _buildProductCard(productProvider.searchResults[index]),
                        childCount: productProvider.searchResults.length,
                      ),
                    ),
                  )
                else ...[
                  SliverToBoxAdapter(
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        _buildHeroBanner(),
                        Positioned(
                          top: 140, // Overlap with banner
                          left: 0,
                          right: 0,
                          child: _buildCategoryLinks(productProvider.categories),
                        ),
                      ],
                    ),
                  ),
                  const SliverToBoxAdapter(child: SizedBox(height: 100)), // Space for category links overlap
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverToBoxAdapter(
                      child: _buildDealsSection(productProvider.dailyDeals),
                    ),
                  ),
                ],
                // Category-wise sliders
                if (productProvider.searchResults.isEmpty)
                  ...productProvider.categories.map((cat) {
                final catProducts = productProvider.getProductsByCategory(cat.id);
                if (catProducts.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());
                return SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  sliver: SliverToBoxAdapter(
                    child: _buildCategorySlider(cat, catProducts),
                  ),
                );
              }).toList(),
              const SliverToBoxAdapter(child: SizedBox(height: 50)),
            ],
          ),
      );
  }

  Widget _buildAppBar() {
    final cart = Provider.of<CartProvider>(context);
    return SliverAppBar(
      pinned: true,
      centerTitle: true,
      title: Image.network(
        'https://quickcart-backend-8x2e.onrender.com/logocroppedquick-bg.png',
        height: 30,
        errorBuilder: (context, error, stackTrace) => const Text('QuickCart', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
      ),
      leading: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.menu, size: 20), 
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
          const Text('ALL', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white)),
        ],
      ),
      actions: [
        Badge(
          label: const Text('3'),
          backgroundColor: Colors.red,
          child: IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationScreen()));
          }),
        ),
        Badge(
          label: Text(cart.totalItems.toString()),
          isLabelVisible: cart.totalItems > 0,
          backgroundColor: Colors.orange,
          child: IconButton(icon: const Icon(Icons.shopping_cart_outlined), onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
          }),
        ),
        const SizedBox(width: 4),
        Builder(
          builder: (context) {
            final auth = Provider.of<AuthProvider>(context);
            if (auth.user != null) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: PopupMenuButton<String>(
                  offset: const Offset(0, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  onSelected: (val) {
                    if (val == 'account') {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
                    } else if (val == 'orders') {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersScreen()));
                    } else if (val == 'wishlist') {
                       Navigator.push(context, MaterialPageRoute(builder: (_) => const WishlistScreen()));
                    } else if (val == 'logout') {
                      auth.logout();
                    } else if (val == 'seller') {
                      auth.becomeProfessional('SELLER');
                    } else if (val == 'agent') {
                      auth.becomeProfessional('DELIVERY_AGENT');
                    }
                  },
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      enabled: false,
                      child: Text(auth.user!.email, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black)),
                    ),
                    const PopupMenuDivider(),
                    _buildPopupItem('orders', Icons.inventory_2_outlined, 'Your Orders'),
                    _buildPopupItem('account', Icons.person_outline, 'Your Profile'),
                    _buildPopupItem('wishlist', Icons.favorite_border, 'Your Wishlist'),
                    _buildPopupItem('settings', Icons.settings_outlined, 'Settings'),
                    _buildPopupItem('seller', Icons.local_shipping_outlined, 'Become a Seller', color: Colors.orange),
                    _buildPopupItem('agent', Icons.shield_outlined, 'Become an Agent', color: Colors.blue),
                    _buildPopupItem('logout', Icons.logout, 'Sign Out', color: Colors.red),
                  ],
                  child: const Icon(Icons.person_outline, color: Colors.white),
                ),
              );
            }
            return IconButton(
              icon: const Icon(Icons.person_outline), 
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
            );
          }
        ),
      ],
      backgroundColor: const Color(0xFF1E293B),
    );
  }

  PopupMenuItem<String> _buildPopupItem(String value, IconData icon, String title, {Color? color}) {
    return PopupMenuItem(
      value: value,
      child: Row(
        children: [
          Icon(icon, size: 20, color: color ?? AppColors.slate600),
          const SizedBox(width: 12),
          Text(title, style: TextStyle(color: color ?? AppColors.slate800, fontWeight: color != null ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    final productProvider = Provider.of<ProductProvider>(context);
    return SliverAppBar(
      pinned: true,
      automaticallyImplyLeading: false,
      backgroundColor: const Color(0xFF1E293B),
      toolbarHeight: 65,
      flexibleSpace: Padding(
        padding: const EdgeInsets.all(10.0),
        child: TextField(
          controller: _searchController,
          onChanged: (val) => productProvider.searchProducts(val),
          decoration: InputDecoration(
            hintText: 'Search QuickCart.in',
            prefixIcon: const Icon(Icons.search, color: AppColors.slate),
            suffixIcon: _searchController.text.isNotEmpty 
              ? IconButton(
                  icon: const Icon(Icons.clear, color: AppColors.slate),
                  onPressed: () {
                    _searchController.clear();
                    productProvider.clearSearch();
                  },
                )
              : const Icon(Icons.mic, color: Colors.orange),
            fillColor: Colors.white,
            filled: true,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(vertical: 0),
          ),
        ),
      ),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      height: 200,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFFED7AA), Color(0xFFFFEDD5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: CachedNetworkImage(
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
        fit: BoxFit.cover,
        placeholder: (context, url) => Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildCategoryLinks(List<Category> categories) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: categories.map((cat) => _buildCategoryItem(cat)).toList(),
        ),
      ),
    );
  }

  Widget _buildCategoryItem(Category category) {
    return Padding(
      padding: const EdgeInsets.only(right: 20),
      child: InkWell(
        onTap: () {
          final provider = Provider.of<ProductProvider>(context, listen: false);
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => CategoryProductsScreen(
              category: category, 
              products: provider.getProductsByCategory(category.id),
            )
          ));
        },
        child: Column(
          children: [
            Container(
              width: 65,
              height: 65,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: category.imageUrl != null 
                  ? CachedNetworkImage(imageUrl: category.imageUrl!, fit: BoxFit.cover)
                  : const Icon(Icons.category, color: Colors.orange),
              ),
            ),
            const SizedBox(height: 8),
            Text(category.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.slate700)),
          ],
        ),
      ),
    );
  }

  Widget _buildDealsSection(List<Product> deals) {
    if (deals.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text("Today's Deals", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const Spacer(),
              TextButton(onPressed: () {}, child: const Text('See all')),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 220,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: deals.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) => _buildProductCard(deals[index]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySlider(Category category, List<Product> products) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(category.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const Spacer(),
              TextButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(
                    builder: (_) => CategoryProductsScreen(
                      category: category, 
                      products: products,
                    )
                  ));
                }, 
                child: const Text('Shop more')),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 220,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: products.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) => _buildProductCard(products[index]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    return InkWell(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDetailsScreen(product: product)));
      },
      child: Container(
        width: 160,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    child: Center(
                      child: product.imageUrl != null 
                        ? CachedNetworkImage(
                            imageUrl: product.imageUrl!,
                            fit: BoxFit.contain,
                          )
                        : const Icon(Icons.image, color: Colors.grey),
                    ),
                  ),
                  if (product.offerPercentage > 0)
                    Positioned(
                      bottom: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFCC0C39),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${product.offerPercentage.toInt()}% off  Deal',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text('₹ ${product.effectivePrice.toInt()}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      if (product.offerPercentage > 0) ...[
                        const SizedBox(width: 4),
                        Text('₹${product.price.toInt()}', style: const TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey, fontSize: 10)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: AppColors.slate700),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSidebar() {
    final auth = Provider.of<AuthProvider>(context);
    final productProvider = Provider.of<ProductProvider>(context);
    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.only(top: 50, left: 16, right: 16, bottom: 20),
            color: const Color(0xFF1E293B),
            child: Row(
              children: [
                const Icon(Icons.person_outline, color: Colors.white, size: 28),
                const SizedBox(width: 12),
                Text(
                  'Hello, ${auth.user?.name ?? 'Guest'}',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 20, 16, 12),
                  child: Text('HIGHLIGHTS', style: TextStyle(color: AppColors.slate500, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2)),
                ),
                _buildDrawerItem(Icons.trending_up, 'Trending Deals', () => Navigator.pop(context), iconColor: Colors.orange),
                _buildDrawerItem(Icons.auto_awesome_outlined, 'Bestsellers', () => Navigator.pop(context), iconColor: Colors.orange),
                const Divider(),
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 20, 16, 12),
                  child: Text('SHOP BY CATEGORY', style: TextStyle(color: AppColors.slate500, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2)),
                ),
                ...productProvider.categories.map((cat) => ListTile(
                  title: Text(cat.name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                  trailing: const Icon(Icons.chevron_right, size: 20, color: AppColors.slate300),
                  onTap: () {
                    final catProducts = productProvider.getProductsByCategory(cat.id);
                    Navigator.push(context, MaterialPageRoute(builder: (_) => CategoryProductsScreen(category: cat, products: catProducts)));
                  },
                  dense: true,
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, VoidCallback onTap, {Color? iconColor}) {
    return ListTile(
      leading: Icon(icon, color: iconColor ?? AppColors.slate600, size: 22),
      title: Text(title, style: const TextStyle(color: AppColors.slate800, fontWeight: FontWeight.w500, fontSize: 14)),
      onTap: onTap,
      dense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
    );
  }
}
