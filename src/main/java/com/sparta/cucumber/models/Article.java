package com.sparta.cucumber.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.sparta.cucumber.dto.ArticleRequestDto;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;

@Getter
@NoArgsConstructor
@Entity(name = "article")
@TableGenerator(
        name = "ARTICLE_GENERATOR",
        table = "MY_SEQUENCES",
        pkColumnValue = "ARTICLE_SEQ", allocationSize = 50)
@JsonIdentityInfo(generator = ObjectIdGenerators.IntSequenceGenerator.class, property = "id")
public class Article extends Timestamped {

    @Id
    @GeneratedValue(strategy = GenerationType.TABLE,generator = "ARTICLE_GENERATOR")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user")
    private User user;
    @Column(length = 500, nullable = false)
    private String title;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    private String image;
    private Double latitude;
    private Double longitude;

    private String fileName;
    private String filePath;

//    @Builder
//    public Article(User user, String title,
//                   String content, String image,
//                   Double latitude, Double longitude) {
//        this.user = user;
//        this.title = title;
//        this.content = content;
//        this.image = image;
//        this.latitude = latitude;
//        this.longitude = longitude;
//    }

    @Builder
    public Article(User user, String title,
                   String content, String image,
                   Double latitude, Double longitude,
                   String fileName, String filePath) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.image = image;
        this.latitude = latitude;
        this.longitude = longitude;

        this.fileName = fileName;
        this.filePath = filePath;

    }
}
