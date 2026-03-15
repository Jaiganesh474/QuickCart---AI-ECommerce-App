package com.quickcart.service;

import com.quickcart.repository.OrderRepository;
import com.quickcart.repository.UserRepository;
import com.quickcart.entity.User;
import com.quickcart.entity.Order;
import com.quickcart.entity.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Map<String, Object> getOrderAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        
        // Weekly Data (last 7 days)
        LocalDateTime lastWeekStart = now.minusDays(7);
        List<Order> weeklyOrders = orderRepository.findByOrderDateBetween(lastWeekStart, now);
        
        // Monthly Data (last 30 days)
        LocalDateTime lastMonthStart = now.minusDays(30);
        List<Order> monthlyOrders = orderRepository.findByOrderDateBetween(lastMonthStart, now);
        
        // Yearly Data (last 12 months)
        LocalDateTime lastYearStart = now.minusYears(1);
        List<Order> yearlyOrders = orderRepository.findByOrderDateBetween(lastYearStart, now);

        Map<String, Object> response = new HashMap<>();
        response.put("weeklyTrend", prepareTrendData(weeklyOrders, 7, "day"));
        response.put("monthlyTrend", prepareTrendData(monthlyOrders, 30, "day"));
        response.put("yearlyTrend", prepareTrendData(yearlyOrders, 12, "month"));
        
        // Averages and Totals
        response.put("weeklyTotal", weeklyOrders.size());
        response.put("monthlyTotal", monthlyOrders.size());
        response.put("yearlyTotal", yearlyOrders.size());
        
        response.put("dailyAvgWeekly", Math.round(((double) weeklyOrders.size() / 7.0) * 100.0) / 100.0);
        response.put("dailyAvgMonthly", Math.round(((double) monthlyOrders.size() / 30.0) * 100.0) / 100.0);
        response.put("monthlyAvgYearly", Math.round(((double) yearlyOrders.size() / 12.0) * 100.0) / 100.0);

        return response;
    }

    public List<Map<String, Object>> getDeliveryAgentAnalytics() {
        List<User> agents = userRepository.findByRole("DELIVERY_AGENT");
        List<Map<String, Object>> agentStats = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (User agent : agents) {
            List<Order> agentOrders = orderRepository.findByDeliveryAgentOrderByUpdatedAtDesc(agent);
            long completedOrders = agentOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("agentId", agent.getId());
            stats.put("agentName", agent.getName());
            stats.put("email", agent.getEmail());
            stats.put("totalCompleted", completedOrders);

            // Per period stats
            long daily = agentOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED && 
                                 (o.getUpdatedAt() != null ? o.getUpdatedAt() : o.getOrderDate()).isAfter(now.minusDays(1)))
                    .count();
            long weekly = agentOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED && 
                                 (o.getUpdatedAt() != null ? o.getUpdatedAt() : o.getOrderDate()).isAfter(now.minusDays(7)))
                    .count();
            long monthly = agentOrders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.DELIVERED && 
                                 (o.getUpdatedAt() != null ? o.getUpdatedAt() : o.getOrderDate()).isAfter(now.minusDays(30)))
                    .count();

            stats.put("avgPerDay", (double) daily); // Just count for last 24h as per request "avg per day" is often interpreted as current rate
            stats.put("avgPerWeek", Math.round(((double) weekly / 7.0) * 100.0) / 100.0);
            stats.put("avgPerMonth", Math.round(((double) monthly / 30.0) * 100.0) / 100.0);
            
            // Multi-range Trends
            stats.put("weeklyTrend", prepareAgentTrend(agentOrders, 7, "day"));
            stats.put("monthlyTrend", prepareAgentTrend(agentOrders, 30, "day"));
            stats.put("yearlyTrend", prepareAgentTrend(agentOrders, 12, "month"));

            agentStats.add(stats);
        }
        return agentStats;
    }

    private List<Map<String, Object>> prepareAgentTrend(List<Order> orders, int count, String unit) {
        List<Map<String, Object>> trendData = new ArrayList<>();
        
        if (unit.equals("day")) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
            for (int i = count - 1; i >= 0; i--) {
                LocalDate targetDate = LocalDate.now().minusDays(i);
                long orderCount = orders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.DELIVERED && 
                                     (o.getUpdatedAt() != null ? o.getUpdatedAt() : o.getOrderDate()).toLocalDate().isEqual(targetDate))
                        .count();
                
                Map<String, Object> point = new HashMap<>();
                point.put("label", targetDate.format(formatter));
                point.put("orders", orderCount);
                trendData.add(point);
            }
        } else if (unit.equals("month")) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
            for (int i = count - 1; i >= 0; i--) {
                LocalDate targetMonth = LocalDate.now().minusMonths(i).withDayOfMonth(1);
                long orderCount = orders.stream()
                        .filter(o -> o.getStatus() == OrderStatus.DELIVERED && 
                                     (o.getUpdatedAt() != null ? o.getUpdatedAt() : o.getOrderDate()).getMonth() == targetMonth.getMonth() && 
                                     (o.getUpdatedAt() != null ? o.getUpdatedAt() : o.getOrderDate()).getYear() == targetMonth.getYear())
                        .count();
                
                Map<String, Object> point = new HashMap<>();
                point.put("label", targetMonth.format(formatter));
                point.put("orders", orderCount);
                trendData.add(point);
            }
        }
        
        return trendData;
    }

    private List<Map<String, Object>> prepareTrendData(List<Order> orders, int count, String unit) {
        List<Map<String, Object>> trendData = new ArrayList<>();
        
        if (unit.equals("day")) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
            for (int i = count - 1; i >= 0; i--) {
                LocalDate targetDate = LocalDate.now().minusDays(i);
                String label = targetDate.format(formatter);
                
                long orderCount = orders.stream()
                        .filter(o -> o.getOrderDate().toLocalDate().isEqual(targetDate))
                        .count();
                
                Map<String, Object> point = new HashMap<>();
                point.put("label", label);
                point.put("orders", orderCount);
                trendData.add(point);
            }
        } else if (unit.equals("month")) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
            for (int i = count - 1; i >= 0; i--) {
                LocalDate targetMonth = LocalDate.now().minusMonths(i).withDayOfMonth(1);
                String label = targetMonth.format(formatter);
                
                long orderCount = orders.stream()
                        .filter(o -> o.getOrderDate().getMonth() == targetMonth.getMonth() && 
                                     o.getOrderDate().getYear() == targetMonth.getYear())
                        .count();
                
                Map<String, Object> point = new HashMap<>();
                point.put("label", label);
                point.put("orders", orderCount);
                trendData.add(point);
            }
        }
        
        return trendData;
    }
}
