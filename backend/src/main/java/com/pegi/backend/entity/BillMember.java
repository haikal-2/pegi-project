package com.pegi.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pegi.backend.entity.enums.BillStatus;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "bill_members")
public class BillMember {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private String memberName;
    private Double amountToPay;

    @Enumerated(EnumType.STRING)
    private BillStatus status;

    @ManyToOne
    @JoinColumn(name = "split_bill_id")
    @JsonIgnore
    private SplitBill splitBill;
    
}
