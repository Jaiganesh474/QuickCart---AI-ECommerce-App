import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
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

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final ScrollController _sidebarController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    _sidebarController.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final productProvider = Provider.of<ProductProvider>(context);
    
    return Scaffold(
      key: _scaffoldKey,
      drawer: _buildSidebar(),
      body: RefreshIndicator(
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
      )
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      pinned: true,
      centerTitle: true,
      title: CachedNetworkImage(
        imageUrl: 'https://quickcart-backend-8x2e.onrender.com/logocroppedquick-bg.png',
        height: 35,
        placeholder: (context, url) => const SizedBox(height: 35, width: 100, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
        errorWidget: (context, url, error) => const Text('QuickCart', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      actions: [
        IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationScreen()));
        }),
        IconButton(icon: const Icon(Icons.shopping_cart_outlined), onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
        }),
        const SizedBox(width: 4),
        Builder(
          builder: (context) {
            final auth = Provider.of<AuthProvider>(context);
            if (auth.user != null) {
              return GestureDetector(
                onTap: () => _scaffoldKey.currentState?.openDrawer(),
                child: Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: CircleAvatar(
                    radius: 16,
                    backgroundColor: Colors.orange.withOpacity(0.9),
                    child: Text(
                      (auth.user?.name ?? 'U').substring(0, 1).toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ),
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
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: category.imageUrl != null 
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: category.imageUrl!,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))),
                      errorWidget: (context, url, error) => const Icon(Icons.category_outlined, color: Colors.orange),
                    ),
                  )
                : const Icon(Icons.category_outlined, color: Colors.orange),
            ),
            const SizedBox(height: 4),
            Text(category.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
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
        width: 150,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 130,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: product.imageUrl != null 
                  ? CachedNetworkImage(
                      imageUrl: product.imageUrl!,
                      fit: BoxFit.contain,
                      placeholder: (context, url) => Shimmer.fromColors(
                        baseColor: AppColors.slate50,
                        highlightColor: Colors.white,
                        child: Container(color: Colors.white),
                      ),
                      errorWidget: (c,e,s) => const Icon(Icons.image, color: AppColors.slate),
                    )
                  : const Center(child: Icon(Icons.image, color: AppColors.slate)),
              ),
            ),
            const SizedBox(height: 8),
            if (product.offerPercentage > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFCC0C39),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text("${product.offerPercentage.toInt()}% off", 
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            const SizedBox(height: 4),
            Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis, 
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, height: 1.2)),
            const Spacer(),
            Text("₹${product.effectivePrice.toInt()}", 
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
      ),
    );
  }

  Widget _buildSidebar() {
    final auth = Provider.of<AuthProvider>(context);
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(color: Color(0xFF1E293B)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const CircleAvatar(backgroundColor: Colors.orange, child: Icon(Icons.person, color: Colors.white)),
                const SizedBox(height: 12),
                Text(auth.user?.name ?? 'Guest User', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const ListTile(leading: Icon(Icons.trending_up), title: Text('Trending Deals')),
          const ListTile(leading: Icon(Icons.star_outline), title: Text('Bestsellers')),
          const Divider(),
          if (auth.user != null) ...[
            ListTile(
              leading: const Icon(Icons.person_outline), 
              title: const Text('My Account'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen())),
            ),
            ListTile(
              leading: const Icon(Icons.shopping_bag_outlined), 
              title: const Text('My Orders'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen())),
            ),
            ListTile(
              leading: const Icon(Icons.notifications_outlined), 
              title: const Text('My Notifications'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationScreen())),
            ),
            const Divider(),
          ],
          if (auth.user == null)
            ListTile(
              leading: const Icon(Icons.login), 
              title: const Text('Login / Sign Up'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
            ),
          if (auth.user?.role == 'ADMIN')
            ListTile(
              leading: const Icon(Icons.admin_panel_settings_outlined), 
              title: const Text('Admin Dashboard'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminDashboardScreen())),
            ),
          if (auth.user?.role == 'DELIVERY_AGENT')
            ListTile(
              leading: const Icon(Icons.delivery_dining_outlined), 
              title: const Text('Delivery Hub'),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const DeliveryDashboardScreen())),
            ),
          if (auth.user != null)
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red), 
              title: const Text('Logout', style: TextStyle(color: Colors.red)),
              onTap: () => auth.logout(),
            ),
        ],
      ),
    );
  }
}
