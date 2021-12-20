package com.sparta.cucumber.chat;

import com.sparta.cucumber.models.Timestamped;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Getter
@Entity(name = "message")
@NoArgsConstructor
public class Notice extends Timestamped {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String content;
    private Long senderId;
    private Long targetId;
    private Long subscriberId;
    private NoticeType type;
    private boolean isRead;

    @Builder
    public Notice(String title, String content, Long senderId, Long targetId, Long subscriberId, NoticeType type) {
        this.targetId = targetId;
        this.title = title;
        this.content = content;
        this.senderId = senderId;
        this.subscriberId = subscriberId;
        this.type = type;
        this.isRead = false;
    }
}