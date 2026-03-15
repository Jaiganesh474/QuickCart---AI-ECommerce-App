package com.quickcart.service;

import com.quickcart.entity.*;
import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.quickcart.repository.ProductRepository productRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SmsService smsService;

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByUpdatedAtDesc(user);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order placeOrder(Order order, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.DELIVERY_AGENT || user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Only customers can place orders. Delivery Agents and Sellers are restricted.");
        }

        if ("COD".equals(order.getPaymentMethod())) {
            if (order.getTotalAmount() >= 5000) {
                throw new RuntimeException("Cash on Delivery is only available for orders below Rs. 5000");
            }
        }

        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setExpectedDeliveryDate(LocalDateTime.now().plusHours(72));
        order.setOrderId("ORD-" + (407516 + new Random().nextInt(900000)));
        order.setTrackingNumber("TRK-" + (10000000 + new Random().nextInt(90000000)));

        order.setMarketplaceFee(10.0);
        order.setFinalAmount(order.getTotalAmount() - order.getDiscountAmount() + order.getMarketplaceFee());

        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null && item.getProduct().getId() != null) {
                Product p = productRepository.findById(item.getProduct().getId())
                        .orElse(item.getProduct());
                item.setProduct(p);
            }
            item.setOrder(order);
        }

        Order savedOrder = orderRepository.save(order);
        sendOrderConfirmationEmail(savedOrder);
        
        // Notify Admin
        notificationService.createNotification(null, 
            "New Order " + savedOrder.getOrderId() + " placed by " + user.getName(), 
            "ORDER", savedOrder.getId().toString());
            
        // Send SMS to user
        if (user.getMobileNumber() != null && !user.getMobileNumber().isEmpty()) {
            smsService.sendSms(user.getMobileNumber(), "Woohoo! Order #" + savedOrder.getOrderId() + " is confirmed. 🛍️ We're getting it ready for you! Tracking: " + savedOrder.getTrackingNumber());
        }
            
        return savedOrder;
    }

    private void sendOrderConfirmationEmail(Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            String imgUrl = item.getProduct() != null ? item.getProduct().getImageUrl() : "";
            if (imgUrl != null && imgUrl.startsWith("/")) {
                imgUrl = "http://localhost:5173" + imgUrl;
            }

            String productUrl = "http://localhost:5173/product/" + (item.getProduct() != null ? item.getProduct().getId() : "");

            itemsHtml.append(String.format(
                    """
                                <tr>
                                    <td width="80" valign="top" style="padding-bottom: 20px;">
                                        <a href="%s" style="text-decoration: none; color: #007185; outline: none;">
                                            <div style="width: 80px; height: 80px; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden; background-color: #f8fafc; display: flex; align-items: center; justify-content: center;">
                                                <img src="%s" alt="Product" style="max-width: 100%%; max-height: 100%%; object-fit: contain; border: 0;">
                                            </div>
                                        </a>
                                    </td>
                                    <td style="padding: 0 0 20px 20px; vertical-align: top;">
                                        <a href="%s" style="text-decoration: none; color: #007185; outline: none;">
                                            <div style="font-weight: 700; color: #007185; font-size: 15px; margin-bottom: 4px;">%s</div>
                                        </a>
                                        <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">Sold by: QuickCart</div>
                                        <div style="font-size: 14px; font-weight: 800; color: #0f172a;">₹%.2f</div>
                                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Quantity: %d</div>
                                    </td>
                                </tr>
                            """,
                    productUrl,
                    imgUrl,
                    productUrl,
                    item.getProduct() != null ? item.getProduct().getName() : "Product",
                    item.getPrice(),
                    item.getQuantity()));
        }

        int statusLevel = 0;
        boolean isCancelled = false;
        if (order.getStatus() != null) {
            String s = order.getStatus().name();
            if (s.equals("PENDING")) statusLevel = 1;
            else if (s.equals("CONFIRMED")) statusLevel = 2;
            else if (s.equals("SHIPPED")) statusLevel = 3;
            else if (s.equals("OUT_FOR_DELIVERY")) statusLevel = 4;
            else if (s.equals("DELIVERED")) statusLevel = 5;
            else if (s.equals("CANCELLED") || s.equals("CANCEL_REQUESTED")) isCancelled = true;
        }

        String blue = "#007185";
        String gray = "#D5D9D9";

        String circle1 = blue;
        String line1 = statusLevel >= 2 ? blue : gray;
        String circle2 = statusLevel >= 2 ? blue : gray;
        String line2 = statusLevel >= 3 ? blue : gray;
        String circle3 = statusLevel >= 3 ? blue : gray;
        String line3 = statusLevel >= 4 ? blue : gray;
        String circle4 = statusLevel >= 4 ? blue : gray;
        String line4 = statusLevel >= 5 ? blue : gray;
        String circle5 = statusLevel >= 5 ? blue : gray;

        String checkMark = "&#10003;";
        String content1 = checkMark;
        String content2 = statusLevel >= 2 ? checkMark : "";
        String content3 = statusLevel >= 3 ? checkMark : "";
        String content4 = statusLevel >= 4 ? checkMark : "";
        String content5 = statusLevel >= 5 ? checkMark : "";

        String headerMessage = "Thanks for your order, "
                + (order.getUser() != null ? order.getUser().getName() : "Customer") + "!";
        String subject = "QuickCart: Your order is placed!";
        String subHeader = "Order Confirmation";

        LocalDateTime deliveryDate = order.getExpectedDeliveryDate();
        if (deliveryDate == null) {
            deliveryDate = order.getOrderDate() != null ? order.getOrderDate().plusDays(3)
                    : LocalDateTime.now().plusDays(3);
        }

        String arrivalInfo = "Arriving: " + deliveryDate.format(DateTimeFormatter.ofPattern("EEEE, MMMM dd"));

        if (order.getStatus() == OrderStatus.SHIPPED) {
            headerMessage = "Your package has been shipped!";
            subject = "Your Order # " + order.getOrderId() + " has been Shipped";
            subHeader = "Out for Delivery is next";
        } else if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
            headerMessage = "Your package is out for delivery!";
            subject = "Your Order # " + order.getOrderId() + " is Out for Delivery";
            arrivalInfo = "Arriving TODAY!";
            subHeader = "Out for Delivery";
            
            if (order.getDeliveryOtp() != null) {
                arrivalInfo += "<br/><div style='margin-top:15px; padding:15px; background-color:#fffbeb; border:1px dashed #fbbf24; border-radius:8px;'>" +
                              "<div style='font-size:12px; color:#92400e; font-weight:bold; text-transform:uppercase;'>Delivery Verification Code</div>" +
                              "<div style='font-size:32px; color:#b45309; font-weight:900; letter-spacing:4px; margin:5px 0;'>" + order.getDeliveryOtp() + "</div>" +
                              "<div style='font-size:11px; color:#92400e;'>Please Provide this OTP to the delivery agent to securely delivery your order.</div></div>";
            }
        } else if (order.getStatus() == OrderStatus.DELIVERED) {
            headerMessage = "Your package was delivered!";
            subject = "Your Order # " + order.getOrderId() + " was Delivered Successfully";
            arrivalInfo = "Delivered on " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
            subHeader = "Delivered";
        } else if (order.getStatus() == OrderStatus.CANCEL_REQUESTED) {
            headerMessage = "Your cancellation request has been received!";
            subject = "Cancellation Request Received: Order # " + order.getOrderId();
            subHeader = "Cancellation Policy Applied";
            arrivalInfo = "Our admin team is reviewing your request. You will be notified once the cancellation is approved and refund is initiated.";
        } else if (order.getStatus() == OrderStatus.CANCELLED) {
            headerMessage = "Your order has been cancelled!";
            subject = "Order # " + order.getOrderId() + " Cancelled";
            arrivalInfo = "Your refund of ₹" + order.getFinalAmount()
                    + " will be processed within 4-5 business days.";
            subHeader = "Refund in Progress";
        }

        String trackerHtml = String.format(
                """
                        <!-- Tracker Module -->
                        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                            <tr>
                                <td align="center">
                                    <table width="95%%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
                                        <tr>
                                            <td width="32" align="center" style="vertical-align: middle;"><div style="width:32px; height:32px; line-height:32px; background-color:%s; color:white; border-radius:50%%; font-size:16px; font-weight:bold; text-align:center; border: 4px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">%s</div></td>
                                            <td style="vertical-align: middle; padding: 0;">
                                                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="line-height:2px; font-size:2px; height:2px;">
                                                    <tr><td height="2" bgcolor="%s" style="height:4px; line-height:2px; font-size:2px;">&nbsp;</td></tr>
                                                </table>
                                            </td>
                                            <td width="32" align="center" style="vertical-align: middle;"><div style="width:32px; height:32px; line-height:32px; background-color:%s; color:white; border-radius:50%%; font-size:16px; font-weight:bold; text-align:center; border: 4px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">%s</div></td>
                                            <td style="vertical-align: middle; padding: 0;">
                                                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="line-height:2px; font-size:2px; height:2px;">
                                                    <tr><td height="2" bgcolor="%s" style="height:4px; line-height:2px; font-size:2px;">&nbsp;</td></tr>
                                                </table>
                                            </td>
                                            <td width="32" align="center" style="vertical-align: middle;"><div style="width:32px; height:32px; line-height:32px; background-color:%s; color:white; border-radius:50%%; font-size:16px; font-weight:bold; text-align:center; border: 4px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">%s</div></td>
                                            <td style="vertical-align: middle; padding: 0;">
                                                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="line-height:2px; font-size:2px; height:2px;">
                                                    <tr><td height="2" bgcolor="%s" style="height:4px; line-height:2px; font-size:2px;">&nbsp;</td></tr>
                                                </table>
                                            </td>
                                            <td width="32" align="center" style="vertical-align: middle;"><div style="width:32px; height:32px; line-height:32px; background-color:%s; color:white; border-radius:50%%; font-size:16px; font-weight:bold; text-align:center; border: 4px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">%s</div></td>
                                            <td style="vertical-align: middle; padding: 0;">
                                                <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="line-height:2px; font-size:2px; height:2px;">
                                                    <tr><td height="2" bgcolor="%s" style="height:4px; line-height:2px; font-size:2px;">&nbsp;</td></tr>
                                                </table>
                                            </td>
                                            <td width="32" align="center" style="vertical-align: middle;"><div style="width:32px; height:32px; line-height:32px; background-color:%s; color:white; border-radius:50%%; font-size:16px; font-weight:bold; text-align:center; border: 4px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">%s</div></td>
                                        </tr>
                                        <tr style="font-size: 10px; color: #555; font-weight: 800; text-transform: uppercase; font-family: 'Arial Black', Gadget, sans-serif;">
                                            <td align="center" style="padding-top:12px;">Ordered</td>
                                            <td></td>
                                            <td align="center" style="padding-top:12px;">Confirmed</td>
                                            <td></td>
                                            <td align="center" style="padding-top:12px;">Shipped</td>
                                            <td></td>
                                            <td align="center" style="padding-top:12px;">Out For Delivery</td>
                                            <td></td>
                                            <td align="center" style="padding-top:12px;">Delivered</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        """,
                circle1, content1, line1, circle2, content2, line2, circle3, content3, line3, circle4, content4, line4, circle5, content5);

        if (isCancelled) {
            String msg = order.getStatus() == OrderStatus.CANCEL_REQUESTED ? "CANCELLATION REQUESTED" : "ORDER CANCELLED";
            String bgColor = order.getStatus() == OrderStatus.CANCEL_REQUESTED ? "#fff7ed" : "#fef2f2";
            String textColor = order.getStatus() == OrderStatus.CANCEL_REQUESTED ? "#c2410c" : "#b91c1c";
            String borderColor = order.getStatus() == OrderStatus.CANCEL_REQUESTED ? "#ffedd5" : "#fee2e2";
            String subMsg = order.getStatus() == OrderStatus.CANCEL_REQUESTED 
                ? "Our admin team is reviewing your request. We'll update you shortly." 
                : "Your refund is being processed and will reflect in 4-5 business days.";

            trackerHtml = String.format("""
                        <div style="background-color: %s; color: %s; padding: 20px; border-radius: 12px; border: 2px solid %s; text-align: center; margin: 30px 0;">
                            <div style="font-family: 'Arial Black', Gadget, sans-serif; text-transform: uppercase; letter-spacing: 1px; font-size: 18px; line-height: 1.2;">%s</div>
                            <div style="font-size: 14px; font-weight: normal; margin-top: 8px; opacity: 0.9;">%s</div>
                        </div>
                    """, bgColor, textColor, borderColor, msg, subMsg);
        }

        String htmlBody = String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f7f9;">
                            <table width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; overflow: hidden; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="background-color: #232f3e; padding: 12px 24px; text-align: center;">
                                        <div style="font-size: 14px; font-weight: bold;">
                                            <a href="http://localhost:5173/orders" style="color: #ffffff; text-decoration: none; margin: 0 10px;">Your Orders</a> |
                                            <a href="http://localhost:5173/account" style="color: #ffffff; text-decoration: none; margin: 0 10px;">Your Account</a> |
                                            <a href="http://localhost:5173/" style="color: #ffffff; text-decoration: none; margin: 0 10px;">Buy Again</a>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px; text-align: center;">
                                        <h1 style="margin: 0 0 10px 0; color: #111; font-size: 22px; font-weight: bold;">%s</h1>
                                        <div style="font-size: 15px; color: #666; font-weight: bold;">%s</div>

                                        %s

                                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 30px 30px 30px;">
                                        <div style="margin-bottom: 24px;">
                                            <h2 style="margin: 0 0 10px 0; color: #111; font-size: 18px;">%s</h2>
                                            <p style="margin: 0 0 5px 0; color: #333; font-weight: bold;">To: %s</p>
                                            <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Order # %s</p>
                                            <a href="http://localhost:5173/orders/%d" style="display: inline-block; background-color: #f0c14b; border: 1px solid #a88734; color: #111; padding: 10px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 1px 0 rgba(255,255,255,.4) inset;">View Details</a>
                                        </div>

                                        <h3 style="margin: 0 0 15px 0; color: #111; font-size: 16px; border-bottom: 2px solid #f3f3f3; padding-bottom: 10px;">Items in this shipment</h3>
                                        <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                                            %s
                                        </table>

                                        <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="border-top: 2px solid #f3f3f3; margin-top: 15px; padding-top: 15px;">
                                            <tr>
                                                <td align="right" style="font-size: 18px; font-weight: 800; color: #111;">Order Total: ₹%.2f</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 30px; text-align: center; background-color: #f7f7f7; color: #888; font-size: 12px; border-top: 1px solid #eee;">
                                        Questions? Contact <a href="mailto:support@quickcart.com" style="color: #008a96; text-decoration: none;">QuickCart Support</a>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                        """,
                headerMessage,
                subHeader,
                trackerHtml,
                arrivalInfo,
                order.getDeliveryAddress() != null ? order.getDeliveryAddress().getFullName() : "Customer",
                order.getOrderId(),
                order.getId(),
                itemsHtml.toString(),
                order.getFinalAmount());

        emailService.sendHtmlEmail(order.getUser().getEmail(), subject, htmlBody);
    }

    public List<Order> getAvailableForDelivery() {
        return orderRepository.findAvailableForDelivery(OrderStatus.SHIPPED, OrderStatus.OUT_FOR_DELIVERY);
    }

    public List<Order> getAgentOrders(String email) {
        User agent = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Agent not found"));
        return orderRepository.findByDeliveryAgentOrderByUpdatedAtDesc(agent);
    }

    public Order assignDeliveryAgent(Long orderId, String agentEmail) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        User agent = userRepository.findByEmail(agentEmail)
            .orElseThrow(() -> new RuntimeException("Agent not found"));
        
        if (agent.getRole() != Role.DELIVERY_AGENT) {
            throw new RuntimeException("User is not a delivery agent");
        }

        // Logic check: Pick only one order at a time
        boolean hasActiveOrder = orderRepository.findAll().stream()
            .anyMatch(o -> o.getDeliveryAgent() != null && 
                          o.getDeliveryAgent().getId().equals(agent.getId()) && 
                          o.getStatus() == OrderStatus.OUT_FOR_DELIVERY);
        
        if (hasActiveOrder) {
            throw new RuntimeException("You already have an active delivery in progress. Please complete it first!");
        }

        if (order.getDeliveryAgent() != null) {
            throw new RuntimeException("Order is already assigned to another agent");
        }
        
        // Assign the agent and update status to OUT_FOR_DELIVERY
        order.setDeliveryAgent(agent);
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        order.setDeliveryOtp(otp);

        Order saved = orderRepository.save(order);
        sendOrderConfirmationEmail(saved);
        
        notificationService.createNotification(order.getUser().getEmail(), 
            "Your order " + order.getOrderId() + " is out for delivery with agent " + agent.getName(), 
            "UPDATE", order.getId().toString());
            
        if (order.getUser().getMobileNumber() != null) {
            String msg = "Great news! Your order #" + order.getOrderId() + " is out for delivery with " + agent.getName() + ". 🚚 Share OTP " + otp + " to receive your package.";
            smsService.sendSms(order.getUser().getMobileNumber(), msg);
        }
            
        return saved;
    }

    public Order confirmDeliveryWithOtp(Long orderId, String otp) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        // Strict status check
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new RuntimeException("Delivery verification failed: Order status is currently " + order.getStatus() + ". It must be OUT_FOR_DELIVERY to confirm delivery.");
        }

        if (order.getDeliveryOtp() == null) {
            throw new RuntimeException("Delivery OTP is not set for this order. Please try picking the order again or contact support.");
        }
        
        if (!order.getDeliveryOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP provided. Please double-check with the customer.");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveryOtp(null); // Clear OTP after success
        Order saved = orderRepository.save(order);
        sendOrderConfirmationEmail(saved);
        
        notificationService.createNotification(order.getUser().getEmail(), 
            "Your Order #" + order.getOrderId() + " has been delivered successfully!", 
            "UPDATE", order.getId().toString());
            
        return saved;
    }

    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Logical check for reverting status, except for transitions to/from
        // cancellation
        if (order.getStatus() != null && status != OrderStatus.CANCELLED && status != OrderStatus.CANCEL_REQUESTED) {
            if (order.getStatus().ordinal() >= status.ordinal() && order.getStatus() != OrderStatus.CANCEL_REQUESTED) {
                throw new RuntimeException("Order status cannot be reverted to a previous stage.");
            }
        }

        if (status == OrderStatus.OUT_FOR_DELIVERY && order.getDeliveryOtp() == null) {
            String otp = String.format("%06d", new Random().nextInt(1000000));
            order.setDeliveryOtp(otp);
        }

        order.setStatus(status);
        order = orderRepository.save(order);
        sendOrderConfirmationEmail(order);
        
        // Notify User
        notificationService.createNotification(order.getUser().getEmail(), 
            "Your order " + order.getOrderId() + " is now " + status.name().replace("_", " "), 
            "UPDATE", order.getId().toString());
            
        // Send SMS to user
        if (order.getUser().getMobileNumber() != null) {
            String statusName = status.name().replace("_", " ");
            String msg;
            
            if (status == OrderStatus.OUT_FOR_DELIVERY && order.getDeliveryOtp() != null) {
                msg = "Great news! Your order #" + order.getOrderId() + " is out for delivery! 🚚 Share OTP " + order.getDeliveryOtp() + " to receive your package.";
            } else {
                msg = "Status Update: Order #" + order.getOrderId() + " is now " + statusName + ". ✨ Stay tuned for further updates from QuickCart!";
            }
            smsService.sendSms(order.getUser().getMobileNumber(), msg);
        }
            
        return order;
    }

    public Order requestCancel(Long id, String email) {
        System.out.println("Processing cancellation request for Order ID: " + id + " by user: " + email);
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            if (!order.getUser().getEmail().equalsIgnoreCase(email)) {
                System.err.println("Cancellation failed: User " + email + " does not own order " + id);
                throw new RuntimeException("Unauthorized: You do not own this order.");
            }

            if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.OUT_FOR_DELIVERY
                    || order.getStatus() == OrderStatus.DELIVERED) {
                System.err.println("Cancellation failed: Order " + id + " is in status " + order.getStatus());
                throw new RuntimeException("Order cannot be cancelled as it is already " + order.getStatus());
            }

            if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.CANCEL_REQUESTED) {
                return order;
            }

            order.setStatus(OrderStatus.CANCEL_REQUESTED);
            order = orderRepository.save(order);
            
            Order savedOrder = orderRepository.findById(id).get();
            sendOrderConfirmationEmail(savedOrder);
            
            // Notify Admin
            notificationService.createNotification(null, 
                "Cancellation requested for Order " + savedOrder.getOrderId(), 
                "CANCEL_REQUEST", savedOrder.getId().toString());
                
            System.out.println("Cancellation request registered for Order ID: " + id);
            return savedOrder;
        } catch (Exception e) {
            System.err.println("Error in requestCancel: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
