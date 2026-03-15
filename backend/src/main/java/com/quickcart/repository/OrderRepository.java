package com.quickcart.repository;

import com.quickcart.entity.Order;
import com.quickcart.entity.User;
import com.quickcart.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByUpdatedAtDesc(User user);
    List<Order> findAllByOrderByUpdatedAtDesc();
    List<Order> findByStatusOrderByUpdatedAtDesc(OrderStatus status);
    List<Order> findByDeliveryAgentOrderByUpdatedAtDesc(User agent);

    @Query("SELECT o FROM Order o WHERE o.status = :shipped OR (o.status = :outForDelivery AND o.deliveryAgent IS NULL) ORDER BY o.updatedAt DESC")
    List<Order> findAvailableForDelivery(
        @Param("shipped") OrderStatus shipped,
        @Param("outForDelivery") OrderStatus outForDelivery
    );

    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
}
