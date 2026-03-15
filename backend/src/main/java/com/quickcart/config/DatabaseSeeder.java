package com.quickcart.config;

import com.quickcart.entity.Category;
import com.quickcart.entity.Product;
import com.quickcart.entity.SubCategory;
import com.quickcart.repository.CategoryRepository;
import com.quickcart.repository.ProductRepository;
import com.quickcart.repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DatabaseSeeder implements CommandLineRunner {

        @Autowired
        private CategoryRepository categoryRepository;

        @Autowired
        private SubCategoryRepository subCategoryRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private JdbcTemplate jdbcTemplate;

        private final Random random = new Random();

        @Override
        public void run(String... args) {
                System.out.println("Cleaning up Database Schema for Coupon Migration...");
                try {
                        // Make old columns nullable to avoid "Field doesn't have default value" errors
                        jdbcTemplate.execute("ALTER TABLE coupon MODIFY COLUMN discount_percentage DOUBLE NULL");
                        jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN discount_percentage DOUBLE NULL");
                        // Also make new columns nullable just in case they were created as mandatory
                        // but skipped in SQL
                        jdbcTemplate.execute("ALTER TABLE coupon MODIFY COLUMN discount_amount DOUBLE NULL");
                        jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN discount_amount DOUBLE NULL");
                        // Fix for address user_id unknown field issue
                        try {
                                jdbcTemplate.execute("ALTER TABLE addresses ADD COLUMN user_id BIGINT");
                                jdbcTemplate.execute(
                                                "ALTER TABLE addresses ADD CONSTRAINT FK_address_user FOREIGN KEY (user_id) REFERENCES users(id)");
                        } catch (Exception e) {
                        }

                        System.out.println("✅ Database schema cleanup successful.");
                } catch (Exception e) {
                        System.out.println("⚠️ Note: DB Cleanup skipped (perhaps columns don't exist yet): "
                                        + e.getMessage());
                }

                System.out.println("Seeding database with Sample Categories and Products...");

                String[] categoryNames = {
                                "Electronics", "Computers & Accessories", "Clothing & Accessories",
                                "Home & Kitchen", "Books", "Beauty", "Furniture", "Grocery & Gourmet Foods",
                                "Jewellery", "Car & Motorbike", "Appliances"
                };

                String[] categoryImages = {
                                "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80", // Electronics
                                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", // Computers
                                "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", // Clothing
                                "https://images.unsplash.com/photo-1556910103-1c02745aae4f?w=800&q=80", // Home &
                                                                                                        // Kitchen
                                "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80", // Books
                                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80", // Beauty
                                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", // Furniture
                                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80", // Grocery
                                "https://images.unsplash.com/photo-1515562141207-7a8f739f7053?w=800&q=80", // Jewellery
                                "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80", // Car
                                "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80" // Appliances
                };

                String[][] subCategoryNames = {
                                { "Televisions", "Headphones", "Cameras", "Mobile Accessories", "Speakers" },
                                { "Laptops", "Desktops", "Monitors", "Printers", "Components" },
                                { "Men's Fashion", "Women's Fashion", "Kids", "Bags", "Watches" },
                                { "Cookware", "Small Appliances", "Decor", "Bedding", "Bath" },
                                { "Fiction", "Non-Fiction", "Sci-Fi", "Educational", "Comics" },
                                { "Skincare", "Makeup", "Haircare", "Fragrances", "Bath & Body" },
                                { "Living Room", "Bedroom", "Office", "Dining", "Outdoor" },
                                { "Snacks", "Beverages", "Spices", "Pantry staples", "Organic" },
                                { "Rings", "Necklaces", "Earrings", "Bracelets", "Gold & Diamond" },
                                { "Car Accessories", "Bike Accessories", "Tires", "Filters", "Cleaning Kits" },
                                { "Refrigerators", "Washing Machines", "Air Conditioners", "Microwaves",
                                                "Water Purifiers" }
                };

                // Unsplash Specific Images for subcategories so products match name flawlessly
                String[][] subCategoryImages = {
                                { "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
                                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                                                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
                                                "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800",
                                                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800" },
                                { "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
                                                "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=800",
                                                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
                                                "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800",
                                                "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800" },
                                { "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800",
                                                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800",
                                                "https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=800",
                                                "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
                                                "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800" },
                                { "https://images.unsplash.com/photo-1588624391673-8b77d61413a3?w=800",
                                                "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?w=800",
                                                "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
                                                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
                                                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800" },
                                { "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
                                                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
                                                "https://images.unsplash.com/photo-1614050529949-a1fc1ee9fc60?w=800",
                                                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
                                                "https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800" },
                                { "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800",
                                                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
                                                "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800",
                                                "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
                                                "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800" },
                                { "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
                                                "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800",
                                                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
                                                "https://images.unsplash.com/photo-1611486212557-88be5ff6f9cf?w=800",
                                                "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800" },
                                { "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
                                                "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800",
                                                "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800",
                                                "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
                                                "https://images.unsplash.com/photo-1615486171448-4fd13a30c511?w=800" },
                                { "https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=800",
                                                "https://images.unsplash.com/photo-1599643478524-fb5f1646eeeb?w=800",
                                                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
                                                "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
                                                "https://images.unsplash.com/photo-1515562141207-7a8f739f7053?w=800" },
                                { "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
                                                "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800",
                                                "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
                                                "https://images.unsplash.com/photo-1582216851411-ae9db3a2b0e8?w=800",
                                                "https://images.unsplash.com/photo-1541348263662-e06836d5a190?w=800" },
                                { "https://images.unsplash.com/photo-1584622781564-1d9876a13d1a?w=800",
                                                "https://images.unsplash.com/photo-1585771724684-2626efbb1312?w=800",
                                                "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
                                                "https://images.unsplash.com/photo-1574747716942-0f0c0575306e?w=800",
                                                "https://images.unsplash.com/photo-1585823131336-7c0f1882d245?w=800" }
                };

                List<SubCategory> allSubCategories = new ArrayList<>();
                List<String> allSubCategoryImages = new ArrayList<>();

                for (int i = 0; i < categoryNames.length; i++) {
                        final String cName = categoryNames[i];
                        final String cImage = categoryImages[i];

                        Category category = categoryRepository.findByName(categoryNames[i]).orElseGet(() -> {
                                Category c = new Category();
                                c.setName(cName);
                                c.setDescription(cName + " Category");
                                c.setImageUrl(cImage);
                                return categoryRepository.save(c);
                        });

                        if (category.getImageUrl() == null || !category.getImageUrl().equals(cImage)) {
                                category.setImageUrl(cImage);
                                categoryRepository.save(category);
                        }

                        for (int obj = 0; obj < subCategoryNames[i].length; obj++) {
                                String sName = subCategoryNames[i][obj];
                                String sImg = subCategoryImages[i][obj];
                                SubCategory subCategory = subCategoryRepository
                                                .findByNameAndCategoryId(sName, category.getId())
                                                .orElseGet(() -> {
                                                        SubCategory s = new SubCategory();
                                                        s.setName(sName);
                                                        s.setDescription(sName + " classification");
                                                        s.setCategory(category);
                                                        return subCategoryRepository.save(s);
                                                });
                                allSubCategories.add(subCategory);
                                allSubCategoryImages.add(sImg);
                        }
                }

                System.out.println(
                                "Applying Exact Image Fixes to existing products so they match their name perfectly...");
                List<Product> allExistingProducts = productRepository.findAll();
                for (Product existingP : allExistingProducts) {
                        int subCatIndex = allSubCategories.indexOf(existingP.getSubCategory());
                        if (subCatIndex != -1) {
                                String correctImage = allSubCategoryImages.get(subCatIndex);
                                boolean isBroken = existingP.getImageUrl() == null ||
                                                existingP.getImageUrl().contains("placeholder.com") ||
                                                existingP.getImageUrl().isEmpty();

                                if (isBroken || !existingP.getImageUrl().equals(correctImage)) {
                                        existingP.setImageUrl(correctImage);
                                        productRepository.save(existingP);
                                }
                        }
                }

                // Keep this off to allow re-seeding/refreshing if needed or just increase the
                // threshold
                if (productRepository.count() >= 500) {
                        System.out.println("✅ Database already populated with 500+ products. Sync complete.");
                        seedAIProducts(); // Still try to seed AI products if missing
                        return;
                }

                String[] adjs = { "Premium", "Luxury", "Standard", "Pro", "Ultra", "Classic", "Modern", "Advanced",
                                "Smart",
                                "Essential" };

                for (int i = 1; i <= 300; i++) {
                        int subIdx = random.nextInt(allSubCategories.size());
                        SubCategory randomSubCat = allSubCategories.get(subIdx);
                        String specificImage = allSubCategoryImages.get(subIdx);
                        Category cat = randomSubCat.getCategory();

                        String name = adjs[random.nextInt(adjs.length)] + " " + randomSubCat.getName() + " "
                                        + cat.getName().split(" ")[0] + " " + i;
                        String desc = "This is a highly rated " + name
                                        + " perfect for everyday use. Manufactured with premium quality materials. Features include high durability, modern aesthetics, and seamless usability.";
                        double price = 100 + (10000 - 100) * random.nextDouble();
                        double offer = random.nextInt(10) > 6 ? random.nextInt(40) + 5 : 0.0;
                        int stock = random.nextInt(100) + 10;
                        boolean isDaily = random.nextInt(10) > 8;

                        Product p = new Product();
                        p.setName(name);
                        p.setDescription(desc);
                        p.setPrice(Math.round(price * 100.0) / 100.0);
                        p.setOfferPercentage((double) offer);
                        p.setStock(stock);
                        p.setDailyOffer(isDaily);
                        p.setImageUrl(specificImage);
                        p.setCategory(cat);
                        p.setSubCategory(randomSubCat);

                        productRepository.save(p);
                }

                System.out.println("✅ Seeded 200 Products Successfully!");

                seedAIProducts();
        }

        private void seedAIProducts() {
                System.out.println("🚀 Seeding ML-Curated Premium Products...");

                Object[][] aiProducts = {
                                { "Electronics", "Headphones", "ZenSound Elite Noise-Cancelling Headphones",
                                                "Experience pure silence with industry-leading noise cancellation. Features include 40-hour battery life, spatial audio, and premium memory foam cushions for all-day comfort.",
                                                18999.0, 15.0, 45, true, "/products/headphones.png" },

                                { "Computers & Accessories", "Monitors",
                                                "VisionMax 49\" UltraWide Curved Gaming Monitor",
                                                "Immerse yourself in a massive 49-inch curved display with 144Hz refresh rate and HDR1000 support. Perfect for extreme multitasking and immersive gaming experiences.",
                                                74999.0, 10.0, 12, false, "/products/monitor.png" },

                                { "Home & Kitchen", "Small Appliances", "BrewMaster Smart Espresso Station",
                                                "Master the art of coffee with our smart espresso machine. Features a built-in grinder, digital touchscreen interface, and customizable pressure profiles for the perfect shot.",
                                                12499.0, 20.0, 25, true, "/products/coffee_maker.png" },

                                { "Clothing & Accessories", "Women's Fashion", "Midnight Silk Gala Evening Gown",
                                                "Flowing midnight blue pure silk dress designed for elegance. Features a subtle side slit and hand-stitched detailing. Perfect for red-carpet events and gala dinners.",
                                                8999.0, 0.0, 15, false, "/products/silk_dress.png" },

                                { "Clothing & Accessories", "Men's Fashion", "Executive Tailored Charcoal 3-Piece Suit",
                                                "Sharp executive suit crafted from premium wool-blend fabric. Includes a tailored jacket, waistcoat, and slim-fit trousers. Perfect for high-stakes business meetings.",
                                                15999.0, 5.0, 20, false, "/products/men_suit.png" },

                                { "Books", "Sci-Fi", "Chronicles of Stardust: Limited Foil Edition",
                                                "The highly anticipated sequel with a stunning holographic foil hardcover. A must-have for sci-fi enthusiasts, featuring exclusive concept art and author notes.",
                                                2499.0, 0.0, 100, false, "/products/scifi_book.png" },

                                { "Beauty", "Skincare", "Aura 24K Gold Rejuvenating Serum",
                                                "Infused with real 24K gold flakes, this serum hydrates and brightens your skin for a youthful glow. Dermatologically tested and suitable for all skin types.",
                                                4499.0, 25.0, 60, true, "/products/serum.png" },

                                { "Furniture", "Living Room", "Emerald Velvet Mid-Century Modern Sofa",
                                                "Luxurious emerald green velvet sofa with tapered gold-finish legs. Adds a touch of vintage sophistication and modern comfort to any living space.",
                                                42999.0, 12.0, 8, false, "/products/sofa.png" },

                                { "Grocery & Gourmet Foods", "Snacks", "Luxis Artisanal Organic Chocolate Collection",
                                                "A decadent collection of hand-crafted dark chocolates using organic cocoa beans. Features unique flavors like sea salt caramel and lavender honey.",
                                                1899.0, 0.0, 200, true, "/products/chocolates.png" },

                                { "Jewellery", "Gold & Diamond", "Eternity Diamond 14K Gold Band",
                                                "Timeless eternity band set with ethically sourced brilliant-cut diamonds in 14K solid gold. A perfect statement of everlasting commitment.",
                                                89999.0, 8.0, 5, false, "/products/diamond_ring.png" },

                                { "Car & Motorbike", "Car Accessories", "Apex Carbon Fiber Custom Steering Wheel",
                                                "Upgrade your driving experience with a lightweight carbon fiber steering wheel. Features perforated leather grips and race-inspired red stitching.",
                                                24999.0, 15.0, 10, false, "/products/steering_wheel.png" },

                                { "Clothing & Accessories", "Bags", "Nomad Premium Leather Backpack",
                                                "A handcrafted brown leather backpack for the modern traveler. Features a padded laptop sleeve, weather-resistant hardware, and ergonomic straps.",
                                                5499.0, 10.0, 40, true, "/products/backpack.png" },

                                { "Clothing & Accessories", "Watches", "Silverstone Minimalist Analogue Watch",
                                                "Understated elegance for your wrist. Silver-tone stainless steel case with a genuine black leather strap and scratch-resistant sapphire crystal.",
                                                6999.0, 20.0, 30, false, "/products/watch.png" },

                                { "Computers & Accessories", "Laptops", "Stealth G-Series Pro Gaming Laptop",
                                                "Power meets portability. Equipped with a 144Hz IPS display, RGB-backlit keyboard, and the latest high-performance cooling system for intense gaming.",
                                                89999.0, 5.0, 15, true, "/products/laptop.png" },

                                { "Home & Kitchen", "Small Appliances", "Nordic Frost Smart Refrigerator",
                                                "A high-end smart refrigerator with a digital screen on the door. Features advanced climate control and energy-efficient cooling technology.",
                                                84999.0, 10.0, 8, false, "/products/fridge.png" },

                                { "Home & Kitchen", "Small Appliances", "AquaClean Front-Load Washing Machine",
                                                "Eco-friendly front-load washing machine with digital display and 8kg capacity. Includes specialized cycles for all fabric types.",
                                                32999.0, 15.0, 12, true, "/products/washing_machine.png" },

                                { "Home & Kitchen", "Small Appliances", "ChefWave Convection Microwave Oven",
                                                "Versatile convection microwave oven for baking, grilling, and reheating. Sleek stainless steel design fits any modern kitchen.",
                                                14499.0, 20.0, 20, false, "/products/microwave.png" },

                                { "Appliances", "Refrigerators", "LG 260L 3 Star Smart Inverter Refrigerator",
                                                "Frost-free double door refrigerator with multi air flow and humidity controller. Maintains freshness for longer periods with energy efficient cooling.",
                                                25990.0, 5.0, 15, true,
                                                "https://images.unsplash.com/photo-1584622781564-1d9876a13d1a?w=800" },

                                { "Appliances", "Air Conditioners", "Samsung 1.5 Ton 5 Star Inverter AC",
                                                "Powerful cooling even at 52°C. Features copper condenser, anti-bacterial filter and silent operation mode for maximum comfort.",
                                                42990.0, 15.0, 10, false,
                                                "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800" },

                                { "Appliances", "Washing Machines", "Whirlpool 7.5 Kg Fully-Automatic Top Load",
                                                "Features 6th Sense Smart Technology and Spiro Wash system for superior cleaning performance with minimal water usage.",
                                                18490.0, 10.0, 25, true,
                                                "https://images.unsplash.com/photo-1585771724684-2626efbb1312?w=800" },

                                { "Appliances", "Water Purifiers", "Kent Grand+ RO+UV+UF Water Purifier",
                                                "Advanced multi-stage purification with TDS controller. Ensures 100% pure and mineral-rich drinking water for your family.",
                                                17500.0, 20.0, 40, false,
                                                "https://images.unsplash.com/photo-1542646399-6330ce1bb25e?w=800" },

                                { "Appliances", "Microwaves", "IFB 30 L Convection Microwave Oven",
                                                "Versatile microwave for baking, grilling, reheating and defrosting. Includes auto-cook menus and child lock safety features.",
                                                14800.0, 5.0, 12, false,
                                                "https://images.unsplash.com/photo-1574747716942-0f0c0575306e?w=800" },

                                { "Appliances", "Refrigerators", "Haier 195 L 4 Star Direct-Cool Refrigerator",
                                                "Compact single door refrigerator with diamond home cooling technology and stabilizer-free operation.",
                                                14990.0, 8.0, 18, true,
                                                "https://images.unsplash.com/photo-1571175432230-01a2462939c7?w=800" },

                                { "Appliances", "Washing Machines", "Panasonic 6 Kg Fully-Automatic Front Load",
                                                "Professional cleaning with active foam system and pause-n-add feature. Energy efficient and gentle on delicate fabrics.",
                                                24990.0, 12.0, 8, false,
                                                "https://images.unsplash.com/photo-1582733772028-2105173f00ca?w=800" },

                                { "Appliances", "Air Conditioners", "Voltas 1.2 Ton 3 Star Inverter Split AC",
                                                "High ambient cooling with turbo mode and dual filtration. Designed for high durability and low maintenance.",
                                                32990.0, 20.0, 5, true,
                                                "https://images.unsplash.com/photo-1563293750-681b40fe5222?w=800" },

                                { "Appliances", "Microwaves", "Morphy Richards 24 L Convection Oven",
                                                "Sleek and powerful convection oven for the modern kitchen. Perfect for larger families and professional-grade baking.",
                                                12999.0, 15.0, 15, false,
                                                "https://images.unsplash.com/photo-1574747716942-0f0c0575306e?w=800" },

                                { "Appliances", "Water Purifiers", "Aquaguard Ritual RO+UV Water Purifier",
                                                "Active Copper technology that infuses copper into your water while removing all impurities. Stay healthy with every sip.",
                                                16490.0, 25.0, 30, true,
                                                "https://images.unsplash.com/photo-1585823131336-7c0f1882d245?w=800" },

                                { "Appliances", "Refrigerators", "Samsung 324L 3 Star Convertible 5-in-1",
                                                "Convertible refrigerator that adjusts to your cooling needs. Twin Cooling Plus technology ensures moisture and freshness.",
                                                36990.0, 10.0, 7, false,
                                                "https://images.unsplash.com/photo-1571175432230-01a2462939c7?w=800" },

                                { "Appliances", "Washing Machines", "Bosch 7 Kg Front Loading Machine",
                                                "German-engineered washing machine with anti-vibration design and allergy-plus program for hygienic cleaning.",
                                                31490.0, 5.0, 10, false,
                                                "https://images.unsplash.com/photo-1582733772028-2105173f00ca?w=800" },

                                { "Appliances", "Air Conditioners", "Lloyd 1.5 Ton 3 Star Inverter AC",
                                                "Rapid cooling with 4-way swing and golden fin evaporator for long-lasting protection against corrosion.",
                                                34990.0, 18.0, 14, false,
                                                "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800" },

                                { "Appliances", "Water Purifiers", "Eureka Forbes Aquasure from Aquaguard",
                                                "Compact and portable RO water purifier with 7-litre tank and smart LED indicators for filter life.",
                                                10990.0, 20.0, 50, true,
                                                "https://images.unsplash.com/photo-1542646399-6330ce1bb25e?w=800" },

                                { "Appliances", "Refrigerators", "Godrej 236 L 2 Star Refrigerator",
                                                "Double door refrigerator with jumbo vegetable tray and anti-bacterial gasket to keep food fresh and healthy.",
                                                20490.0, 7.0, 22, false,
                                                "https://images.unsplash.com/photo-1584622781564-1d9876a13d1a?w=800" },

                                { "Appliances", "Washing Machines", "Samsung 8 Kg Top Loading Machine",
                                                "Wobble technology for dynamic water flow and diamond drum to prevent fabric damage. Deep cleaning with magic filter.",
                                                22990.0, 12.0, 20, true,
                                                "https://images.unsplash.com/photo-1585771724684-2626efbb1312?w=800" },

                                { "Appliances", "Microwaves", "Panasonic 20L Solo Microwave Oven",
                                                "Simple and efficient solo microwave for everyday reheating and defrosting. Intuitive jog dial controls.",
                                                6990.0, 10.0, 60, false,
                                                "https://images.unsplash.com/photo-1574747716942-0f0c0575306e?w=800" },

                                { "Appliances", "Air Conditioners", "Daikin 1.5 Ton 5 Star Inverter AC",
                                                "Highest energy efficiency rating. Features Econo mode, power chill and indoor unit quiet operation for a peaceful sleep.",
                                                48990.0, 5.0, 6, false,
                                                "https://images.unsplash.com/photo-1563293750-681b40fe5222?w=800" },

                                { "Appliances", "Water Purifiers", "V-Guard Zenora RO+UF+MB Water Purifier",
                                                "World-class RO membrane and ultrafiltration for 100% safety. Compact black design that fits any kitchen.",
                                                9990.0, 15.0, 35, false,
                                                "https://images.unsplash.com/photo-1585823131336-7c0f1882d245?w=800" }
                };

                for (Object[] prodData : aiProducts) {
                        String catName = (String) prodData[0];
                        String subCatName = (String) prodData[1];
                        String name = (String) prodData[2];
                        String desc = (String) prodData[3];
                        double price = (Double) prodData[4];
                        double offer = (Double) prodData[5];
                        int stock = (Integer) prodData[6];
                        boolean daily = (Boolean) prodData[7];
                        String img = (String) prodData[8];

                        if (productRepository.findByName(name).isPresent())
                                continue;

                        Category cat = categoryRepository.findByName(catName).orElse(null);
                        if (cat == null)
                                continue;

                        SubCategory subCat = subCategoryRepository.findByNameAndCategoryId(subCatName, cat.getId())
                                        .orElse(null);
                        if (subCat == null) {
                                subCat = new SubCategory();
                                subCat.setName(subCatName);
                                subCat.setCategory(cat);
                                subCat = subCategoryRepository.save(subCat);
                        }

                        Product p = new Product();
                        p.setName(name);
                        p.setDescription(desc);
                        p.setPrice(price);
                        p.setOfferPercentage(offer);
                        p.setStock(stock);
                        p.setDailyOffer(daily);
                        p.setImageUrl(img);
                        p.setCategory(cat);
                        p.setSubCategory(subCat);

                        productRepository.save(p);
                }
                System.out.println("✅ ML-Curated Products Seeded Successfully!");
        }
}
