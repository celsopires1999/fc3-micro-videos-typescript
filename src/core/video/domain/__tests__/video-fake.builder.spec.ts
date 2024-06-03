import { CastMemberId } from "@core/cast-member/domain/cast-member.aggregate";
import { CategoryId } from "@core/category/domain/category.aggregate";
import { GenreId } from "@core/genre/domain/genre.aggregate";
import { Chance } from "chance";
import { Banner } from "../banner.vo";
import { Rating } from "../rating.vo";
import { ThumbnailHalf } from "../thumbnail-half.vo";
import { Thumbnail } from "../thumbnail.vo";
import { Trailer } from "../trailer.vo";
import { VideoFakeBuilder } from "../video-fake.builder";
import { VideoMedia } from "../video-media.vo";
import { VideoId } from "../video.aggregate";

describe("VideoFakerBuilder Unit Tests", () => {
  describe("video_id prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();

    test("should throw error when any with methods has called", () => {
      expect(() => faker.video_id).toThrowError(
        new Error("Property video_id not have a factory, use 'with' methods"),
      );
    });

    test("should be undefined", () => {
      expect(faker["_video_id"]).toBeUndefined();
    });

    test("withVideoId", () => {
      const video_id = new VideoId();
      const $this = faker.withVideoId(video_id);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_video_id"]).toBe(video_id);

      faker.withVideoId(() => video_id);
      //@ts-expect-error _video_id is a callable
      expect(faker["_video_id"]()).toBe(video_id);

      expect(faker.video_id).toBe(video_id);
    });

    test("should pass index to video_id factory", () => {
      let mockFactory = jest.fn(() => new VideoId());
      faker.withVideoId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const genreId = new VideoId();
      mockFactory = jest.fn(() => genreId);
      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withVideoId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].video_id).toBe(genreId);
      expect(fakerMany.build()[1].video_id).toBe(genreId);
    });
  });

  describe("title prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("should be a function", () => {
      expect(typeof faker["_title"]).toBe("function");
    });

    test("should call the word method", () => {
      const chance = Chance.Chance();
      const spyMethod = jest.spyOn(chance, "word");
      faker["chance"] = chance;
      faker.build();
      expect(spyMethod).toHaveBeenCalled();
    });

    test("withTitle", () => {
      const $this = faker.withTitle("test title");
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_title"]).toBe("test title");

      faker.withTitle(() => "test title");
      //@ts-expect-error _title is callable
      expect(faker["_title"]()).toBe("test title");

      expect(faker.title).toBe("test title");
    });

    test("should pass index to title factory", () => {
      faker.withTitle((index) => `test title ${index}`);
      const video = faker.build();
      expect(video.title).toBe(`test title 0`);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withTitle((index) => `test title ${index}`);
      const categories = fakerMany.build();

      expect(categories[0].title).toBe(`test title 0`);
      expect(categories[1].title).toBe(`test title 1`);
    });

    test("invalid too long case", () => {
      const $this = faker.withInvalidTitleTooLong();
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_title"].length).toBe(256);

      const tooLong = "a".repeat(256);
      faker.withInvalidTitleTooLong(tooLong);
      expect(faker["_title"].length).toBe(256);
      expect(faker["_title"]).toBe(tooLong);
    });
  });

  describe("description prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("should be a function", () => {
      expect(typeof faker["_description"]).toBe("function");
    });

    test("should call the paragraph method", () => {
      const chance = Chance.Chance();
      const spyMethod = jest.spyOn(chance, "paragraph");
      faker["chance"] = chance;
      faker.build();
      expect(spyMethod).toHaveBeenCalledTimes(1);
    });

    test("withDescription", () => {
      const $this = faker.withDescription("test description");
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_description"]).toBe("test description");
      faker.withDescription(() => "test description");
      //@ts-expect-error _description is callable
      expect(faker["_description"]()).toBe("test description");

      expect(faker.description).toBe("test description");
    });

    test("should pass index to description factory", () => {
      faker.withDescription((index) => `test description ${index}`);
      const category = faker.build();
      expect(category.description).toBe(`test description 0`);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withDescription((index) => `test description ${index}`);
      const videos = fakerMany.build();

      expect(videos[0].description).toBe(`test description 0`);
      expect(videos[1].description).toBe(`test description 1`);
    });
  });

  describe("year_launched prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("should be a function", () => {
      expect(typeof faker["_year_launched"]).toBe("function");
    });

    test("should call the year method", () => {
      const chance = Chance.Chance();
      const spyMethod = jest.spyOn(chance, "year");
      faker["chance"] = chance;
      faker.build();
      expect(spyMethod).toHaveBeenCalled();
    });

    test("withYearLaunched", () => {
      const $this = faker.withYearLaunched(1950);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_year_launched"]).toBe(1950);
      faker.withYearLaunched(() => 1951);
      //@ts-expect-error _year_launched is callable
      expect(faker["_year_launched"]()).toBe(1951);

      expect(faker.year_launched).toBe(1951);
    });

    test("should pass index to year_launched factory", () => {
      faker.withYearLaunched((index) => 1950 + index);
      const video = faker.build();
      expect(video.year_launched).toBe(1950);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withYearLaunched((index) => 1950 + index);
      const videos = fakerMany.build();

      expect(videos[0].year_launched).toBe(1950);
      expect(videos[1].year_launched).toBe(1951);
    });
  });

  describe("duration prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("should be a function", () => {
      expect(typeof faker["_duration"]).toBe("function");
    });

    test("should call the integer method", () => {
      const chance = Chance.Chance();
      const spyMethod = jest.spyOn(chance, "integer");
      faker["chance"] = chance;
      faker.build();
      expect(spyMethod).toHaveBeenCalled();
    });

    test("withDuration", () => {
      const $this = faker.withDuration(200);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_duration"]).toBe(200);
      faker.withDuration(() => 201);
      //@ts-expect-error _duration is callable
      expect(faker["_duration"]()).toBe(201);

      expect(faker.duration).toBe(201);
    });

    test("should pass index to duration factory", () => {
      faker.withDuration((index) => 200 + index);
      const video = faker.build();
      expect(video.duration).toBe(200);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withDuration((index) => 200 + index);
      const videos = fakerMany.build();

      expect(videos[0].duration).toBe(200);
      expect(videos[1].duration).toBe(201);
    });
  });

  describe("rating prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("should be a function", () => {
      expect(typeof faker["_rating"]).toBe("function");
    });

    test("withRating", () => {
      const $this = faker.withRating(Rating.create10());
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_rating"]).toEqual(Rating.create10());
      faker.withRating(() => Rating.create14());
      //@ts-expect-error _rating is callable
      expect(faker["_rating"]()).toEqual(Rating.create14());

      expect(faker.rating).toEqual(Rating.create14());
    });

    test("should pass index to rating factory", () => {
      faker.withRating((index) =>
        index % 2 === 0 ? Rating.createRL() : Rating.create10(),
      );
      const video = faker.build();
      expect(video.rating).toEqual(Rating.createRL());

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withRating((index) =>
        index % 2 === 0 ? Rating.createRL() : Rating.create10(),
      );
      const videos = fakerMany.build();

      expect(videos[0].rating).toEqual(Rating.createRL());
      expect(videos[1].rating).toEqual(Rating.create10());
    });
  });

  describe("is_opened prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("should be a function", () => {
      expect(typeof faker["_opened"]).toBe("function");
    });

    test("withMarkAsOpened", () => {
      const $this = faker.withMarkAsOpened();
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_opened"]).toBeTruthy();
      expect(faker.is_opened).toBeTruthy();
    });

    test("withMarkAsNotOpened", () => {
      const $this = faker.withMarkAsNotOpened();
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_opened"]).toBeFalsy();
      expect(faker.is_opened).toBeFalsy();
    });
  });

  describe("banner prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("withBanner", () => {
      const banner1 = new Banner({
        name: "banner1.png",
        location: "path-banner1",
      });
      const $this = faker.withBanner(banner1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);

      expect(faker["_banner"]).toEqual(banner1);

      const banner2 = new Banner({
        name: "banner2.png",
        location: "path-banner2",
      });
      faker.withBanner(() => banner2);
      //@ts-expect-error _rating is callable
      expect(faker["_banner"]()).toEqual(banner2);

      expect(faker.banner).toEqual(banner2);
    });
  });

  describe("thumbnail prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("withThumbnail", () => {
      const thumbnail1 = new Thumbnail({
        name: "thumbnail1.png",
        location: "path-thumbnail1",
      });
      const $this = faker.withThumbnail(thumbnail1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);

      expect(faker["_thumbnail"]).toEqual(thumbnail1);

      const thumbnail2 = new Thumbnail({
        name: "thumbnail2.png",
        location: "path-thumbnail2",
      });
      faker.withThumbnail(() => thumbnail2);
      //@ts-expect-error _rating is callable
      expect(faker["_thumbnail"]()).toEqual(thumbnail2);

      expect(faker.thumbnail).toEqual(thumbnail2);
    });
  });

  describe("thumbnail_half prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("withThumbnailHalf", () => {
      const thumbnail_half1 = new ThumbnailHalf({
        name: "thumbnail_half1.png",
        location: "path-thumbnail_half1",
      });
      const $this = faker.withThumbnailHalf(thumbnail_half1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);

      expect(faker["_thumbnail_half"]).toEqual(thumbnail_half1);

      const thumbnail_half2 = new ThumbnailHalf({
        name: "thumbnail_half2.png",
        location: "path-thumbnail_half2",
      });
      faker.withThumbnailHalf(() => thumbnail_half2);
      //@ts-expect-error _rating is callable
      expect(faker["_thumbnail_half"]()).toEqual(thumbnail_half2);

      expect(faker.thumbnail_half).toEqual(thumbnail_half2);
    });
  });

  describe("trailer prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("withTrailer", () => {
      const trailer1 = Trailer.create({
        name: "trailer1.png",
        raw_location: "path-trailer1",
      });
      const $this = faker.withTrailer(trailer1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);

      expect(faker["_trailer"]).toEqual(trailer1);

      const trailer2 = Trailer.create({
        name: "trailer2.png",
        raw_location: "path-trailer2",
      });
      faker.withTrailer(() => trailer2);
      //@ts-expect-error _rating is callable
      expect(faker["_trailer"]()).toEqual(trailer2);

      expect(faker.trailer).toEqual(trailer2);
    });
  });

  describe("video prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    test("withTrailer", () => {
      const video1 = Trailer.create({
        name: "video1.png",
        raw_location: "path-video1",
      });
      const $this = faker.withVideo(video1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);

      expect(faker["_video"]).toEqual(video1);

      const video2 = Trailer.create({
        name: "video2.png",
        raw_location: "path-video2",
      });
      faker.withVideo(() => video2);
      //@ts-expect-error _rating is callable
      expect(faker["_video"]()).toEqual(video2);

      expect(faker.video).toEqual(video2);
    });
  });

  describe("categories_id prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    it("should be empty", () => {
      expect(faker["_categories_id"]).toBeInstanceOf(Array);
    });

    test("addCategoryId", () => {
      const categoryId1 = new CategoryId();
      const $this = faker.addCategoryId(categoryId1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_categories_id"]).toStrictEqual([categoryId1]);

      const categoryId2 = new CategoryId();
      faker.addCategoryId(() => categoryId2);

      expect([
        faker["_categories_id"][0],
        //@ts-expect-error _categories_id is callable
        faker["_categories_id"][1](),
      ]).toStrictEqual([categoryId1, categoryId2]);
    });

    it("should pass index to categories_id factory", () => {
      const categoriesId = [new CategoryId(), new CategoryId()];
      faker.addCategoryId((index) => categoriesId[index]);
      const genre = faker.build();

      expect(genre.categories_id.get(categoriesId[0].id)).toBe(categoriesId[0]);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.addCategoryId((index) => categoriesId[index]);
      const genres = fakerMany.build();

      expect(genres[0].categories_id.get(categoriesId[0].id)).toBe(
        categoriesId[0],
      );

      expect(genres[1].categories_id.get(categoriesId[1].id)).toBe(
        categoriesId[1],
      );
    });
  });

  describe("genres_id prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    it("should be empty", () => {
      expect(faker["_genres_id"]).toBeInstanceOf(Array);
    });

    test("addGenreId", () => {
      const genreId1 = new GenreId();
      const $this = faker.addGenreId(genreId1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_genres_id"]).toStrictEqual([genreId1]);

      const genreId2 = new GenreId();
      faker.addGenreId(() => genreId2);

      expect([
        faker["_genres_id"][0],
        //@ts-expect-error _genres_id is callable
        faker["_genres_id"][1](),
      ]).toStrictEqual([genreId1, genreId2]);
    });

    it("should pass index to genres_id factory", () => {
      const genresId = [new GenreId(), new GenreId()];
      faker.addGenreId((index) => genresId[index]);
      const genre = faker.build();

      expect(genre.genres_id.get(genresId[0].id)).toBe(genresId[0]);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.addGenreId((index) => genresId[index]);
      const genres = fakerMany.build();

      expect(genres[0].genres_id.get(genresId[0].id)).toBe(genresId[0]);

      expect(genres[1].genres_id.get(genresId[1].id)).toBe(genresId[1]);
    });
  });

  describe("cast_members_id prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();
    it("should be empty", () => {
      expect(faker["_cast_members_id"]).toBeInstanceOf(Array);
    });

    test("addCastMemberId", () => {
      const castMemberId1 = new CastMemberId();
      const $this = faker.addCastMemberId(castMemberId1);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_cast_members_id"]).toStrictEqual([castMemberId1]);

      const castMemberId2 = new CastMemberId();
      faker.addCastMemberId(() => castMemberId2);

      expect([
        faker["_cast_members_id"][0],
        //@ts-expect-error _cast_members_id is callable
        faker["_cast_members_id"][1](),
      ]).toStrictEqual([castMemberId1, castMemberId2]);
    });

    it("should pass index to cast_members_id factory", () => {
      const castMembersId = [new CastMemberId(), new CastMemberId()];
      faker.addCastMemberId((index) => castMembersId[index]);
      const genre = faker.build();

      expect(genre.cast_members_id.get(castMembersId[0].id)).toBe(
        castMembersId[0],
      );

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.addCastMemberId((index) => castMembersId[index]);
      const castMembers = fakerMany.build();

      expect(castMembers[0].cast_members_id.get(castMembersId[0].id)).toBe(
        castMembersId[0],
      );

      expect(castMembers[1].cast_members_id.get(castMembersId[1].id)).toBe(
        castMembersId[1],
      );
    });
  });

  describe("created_at prop", () => {
    const faker = VideoFakeBuilder.aVideoWithoutMedias();

    test("should throw error when any with methods has called", () => {
      const fakerVideo = VideoFakeBuilder.aVideoWithoutMedias();
      expect(() => fakerVideo.created_at).toThrowError(
        new Error("Property created_at not have a factory, use 'with' methods"),
      );
    });

    test("should be undefined", () => {
      expect(faker["_created_at"]).toBeUndefined();
    });

    test("withCreatedAt", () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(VideoFakeBuilder);
      expect(faker["_created_at"]).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _created_at is a callable
      expect(faker["_created_at"]()).toBe(date);
      expect(faker.created_at).toBe(date);
    });

    test("should pass index to created_at factory", () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const genre = faker.build();
      expect(genre.created_at.getTime()).toBe(date.getTime() + 2);

      const fakerMany = VideoFakeBuilder.theVideosWithoutMedias(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const categories = fakerMany.build();

      expect(categories[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(categories[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  it("should create a video without medias", () => {
    let video = VideoFakeBuilder.aVideoWithoutMedias().build();

    expect(video.video_id).toBeInstanceOf(VideoId);
    expect(typeof video.title === "string").toBeTruthy();
    expect(typeof video.description === "string").toBeTruthy();
    expect(typeof video.year_launched === "number").toBeTruthy();
    expect(typeof video.duration === "number").toBeTruthy();
    expect(video.rating).toEqual(Rating.createRL());
    expect(video.is_opened).toBeTruthy();
    expect(video.is_published).toBeFalsy();
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnail_half).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categories_id).toBeInstanceOf(Map);
    expect(video.categories_id.size).toBe(1);
    expect(video.categories_id.values().next().value).toBeInstanceOf(
      CategoryId,
    );
    expect(video.genres_id).toBeInstanceOf(Map);
    expect(video.genres_id.size).toBe(1);
    expect(video.genres_id.values().next().value).toBeInstanceOf(GenreId);
    expect(video.cast_members_id).toBeInstanceOf(Map);
    expect(video.cast_members_id.size).toBe(1);
    expect(video.cast_members_id.values().next().value).toBeInstanceOf(
      CastMemberId,
    );
    expect(video.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    video = VideoFakeBuilder.aVideoWithoutMedias()
      .withVideoId(videoId)
      .withTitle("name test")
      .withDescription("description test")
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withCreatedAt(created_at)
      .build();
    expect(video.video_id.id).toBe(videoId.id);
    expect(video.title).toBe("name test");
    expect(video.description).toBe("description test");
    expect(video.year_launched).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toEqual(Rating.create10());
    expect(video.is_opened).toBeFalsy();
    expect(video.is_published).toBeFalsy();
    expect(video.banner).toBeNull();
    expect(video.thumbnail).toBeNull();
    expect(video.thumbnail_half).toBeNull();
    expect(video.trailer).toBeNull();
    expect(video.video).toBeNull();
    expect(video.categories_id).toBeInstanceOf(Map);
    expect(video.categories_id.get(categoryId1.id)).toBe(categoryId1);
    expect(video.categories_id.get(categoryId2.id)).toBe(categoryId2);
    expect(video.genres_id).toBeInstanceOf(Map);
    expect(video.genres_id.get(genreId1.id)).toBe(genreId1);
    expect(video.genres_id.get(genreId2.id)).toBe(genreId2);
    expect(video.cast_members_id).toBeInstanceOf(Map);
    expect(video.cast_members_id.get(castMemberId1.id)).toBe(castMemberId1);
    expect(video.cast_members_id.get(castMemberId2.id)).toBe(castMemberId2);
    expect(video.created_at).toEqual(created_at);
  });

  it("should create a video with medias", () => {
    let video = VideoFakeBuilder.aVideoWithAllMedias().build();

    expect(video.video_id).toBeInstanceOf(VideoId);
    expect(typeof video.title === "string").toBeTruthy();
    expect(typeof video.description === "string").toBeTruthy();
    expect(typeof video.year_launched === "number").toBeTruthy();
    expect(typeof video.duration === "number").toBeTruthy();
    expect(video.rating).toEqual(Rating.createRL());
    expect(video.is_opened).toBeTruthy();
    expect(video.is_published).toBeFalsy();
    expect(video.banner).toBeInstanceOf(Banner);
    expect(video.thumbnail).toBeInstanceOf(Thumbnail);
    expect(video.thumbnail_half).toBeInstanceOf(ThumbnailHalf);
    expect(video.trailer).toBeInstanceOf(Trailer);
    expect(video.video).toBeInstanceOf(VideoMedia);
    expect(video.categories_id).toBeInstanceOf(Map);
    expect(video.categories_id.size).toBe(1);
    expect(video.categories_id.values().next().value).toBeInstanceOf(
      CategoryId,
    );
    expect(video.genres_id).toBeInstanceOf(Map);
    expect(video.genres_id.size).toBe(1);
    expect(video.genres_id.values().next().value).toBeInstanceOf(GenreId);
    expect(video.cast_members_id).toBeInstanceOf(Map);
    expect(video.cast_members_id.size).toBe(1);
    expect(video.cast_members_id.values().next().value).toBeInstanceOf(
      CastMemberId,
    );
    expect(video.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const banner = new Banner({
      location: "location",
      name: "name",
    });
    const thumbnail = new Thumbnail({
      location: "location",
      name: "name",
    });
    const thumbnail_half = new ThumbnailHalf({
      location: "location",
      name: "name",
    });
    const trailer = Trailer.create({
      raw_location: "raw_location",
      name: "name",
    });
    const videoMedia = VideoMedia.create({
      raw_location: "raw_location",
      name: "name",
    });
    video = VideoFakeBuilder.aVideoWithAllMedias()
      .withVideoId(videoId)
      .withTitle("name test")
      .withDescription("description test")
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withBanner(banner)
      .withThumbnail(thumbnail)
      .withThumbnailHalf(thumbnail_half)
      .withTrailer(trailer)
      .withVideo(videoMedia)
      .withCreatedAt(created_at)
      .build();
    expect(video.video_id.id).toBe(videoId.id);
    expect(video.title).toBe("name test");
    expect(video.description).toBe("description test");
    expect(video.year_launched).toBe(2020);
    expect(video.duration).toBe(90);
    expect(video.rating).toEqual(Rating.create10());
    expect(video.is_opened).toBeFalsy();
    expect(video.is_published).toBeFalsy();
    expect(video.banner).toBe(banner);
    expect(video.thumbnail).toBe(thumbnail);
    expect(video.thumbnail_half).toBe(thumbnail_half);
    expect(video.trailer).toBe(trailer);
    expect(video.video).toBe(videoMedia);
    expect(video.categories_id).toBeInstanceOf(Map);
    expect(video.categories_id.get(categoryId1.id)).toBe(categoryId1);
    expect(video.categories_id.get(categoryId2.id)).toBe(categoryId2);
    expect(video.genres_id).toBeInstanceOf(Map);
    expect(video.genres_id.get(genreId1.id)).toBe(genreId1);
    expect(video.genres_id.get(genreId2.id)).toBe(genreId2);
    expect(video.cast_members_id).toBeInstanceOf(Map);
    expect(video.cast_members_id.get(castMemberId1.id)).toBe(castMemberId1);
    expect(video.cast_members_id.get(castMemberId2.id)).toBe(castMemberId2);
    expect(video.created_at).toEqual(created_at);
  });

  it("should create many videos without medias", () => {
    const faker = VideoFakeBuilder.theVideosWithoutMedias(2);
    let videos = faker.build();
    videos.forEach((video) => {
      expect(video.video_id).toBeInstanceOf(VideoId);
      expect(typeof video.title === "string").toBeTruthy();
      expect(typeof video.description === "string").toBeTruthy();
      expect(typeof video.year_launched === "number").toBeTruthy();
      expect(typeof video.duration === "number").toBeTruthy();
      expect(video.rating).toEqual(Rating.createRL());
      expect(video.is_opened).toBeTruthy();
      expect(video.is_published).toBeFalsy();
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnail_half).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categories_id).toBeInstanceOf(Map);
      expect(video.categories_id.size).toBe(1);
      expect(video.categories_id.values().next().value).toBeInstanceOf(
        CategoryId,
      );
      expect(video.genres_id).toBeInstanceOf(Map);
      expect(video.genres_id.size).toBe(1);
      expect(video.genres_id.values().next().value).toBeInstanceOf(GenreId);
      expect(video.cast_members_id).toBeInstanceOf(Map);
      expect(video.cast_members_id.size).toBe(1);
      expect(video.cast_members_id.values().next().value).toBeInstanceOf(
        CastMemberId,
      );
      expect(video.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    videos = VideoFakeBuilder.theVideosWithoutMedias(2)
      .withVideoId(videoId)
      .withTitle("name test")
      .withDescription("description test")
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withCreatedAt(created_at)
      .build();
    videos.forEach((video) => {
      expect(video.video_id.id).toBe(videoId.id);
      expect(video.title).toBe("name test");
      expect(video.description).toBe("description test");
      expect(video.year_launched).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toEqual(Rating.create10());
      expect(video.is_opened).toBeFalsy();
      expect(video.is_published).toBeFalsy();
      expect(video.banner).toBeNull();
      expect(video.thumbnail).toBeNull();
      expect(video.thumbnail_half).toBeNull();
      expect(video.trailer).toBeNull();
      expect(video.video).toBeNull();
      expect(video.categories_id).toBeInstanceOf(Map);
      expect(video.categories_id.get(categoryId1.id)).toBe(categoryId1);
      expect(video.categories_id.get(categoryId2.id)).toBe(categoryId2);
      expect(video.genres_id).toBeInstanceOf(Map);
      expect(video.genres_id.get(genreId1.id)).toBe(genreId1);
      expect(video.genres_id.get(genreId2.id)).toBe(genreId2);
      expect(video.cast_members_id).toBeInstanceOf(Map);
      expect(video.cast_members_id.get(castMemberId1.id)).toBe(castMemberId1);
      expect(video.cast_members_id.get(castMemberId2.id)).toBe(castMemberId2);
      expect(video.created_at).toEqual(created_at);
    });
  });

  it("should create many videos with medias", () => {
    const faker = VideoFakeBuilder.theVideosWithAllMedias(2);
    let videos = faker.build();
    videos.forEach((video) => {
      expect(video.video_id).toBeInstanceOf(VideoId);
      expect(typeof video.title === "string").toBeTruthy();
      expect(typeof video.description === "string").toBeTruthy();
      expect(typeof video.year_launched === "number").toBeTruthy();
      expect(typeof video.duration === "number").toBeTruthy();
      expect(video.rating).toEqual(Rating.createRL());
      expect(video.is_opened).toBeTruthy();
      expect(video.is_published).toBeFalsy();
      expect(video.banner).toBeInstanceOf(Banner);
      expect(video.thumbnail).toBeInstanceOf(Thumbnail);
      expect(video.thumbnail_half).toBeInstanceOf(ThumbnailHalf);
      expect(video.trailer).toBeInstanceOf(Trailer);
      expect(video.video).toBeInstanceOf(VideoMedia);
      expect(video.categories_id).toBeInstanceOf(Map);
      expect(video.categories_id.size).toBe(1);
      expect(video.categories_id.values().next().value).toBeInstanceOf(
        CategoryId,
      );
      expect(video.genres_id).toBeInstanceOf(Map);
      expect(video.genres_id.size).toBe(1);
      expect(video.genres_id.values().next().value).toBeInstanceOf(GenreId);
      expect(video.cast_members_id).toBeInstanceOf(Map);
      expect(video.cast_members_id.size).toBe(1);
      expect(video.cast_members_id.values().next().value).toBeInstanceOf(
        CastMemberId,
      );
      expect(video.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const videoId = new VideoId();
    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();
    const banner = new Banner({
      location: "location",
      name: "name",
    });
    const thumbnail = new Thumbnail({
      location: "location",
      name: "name",
    });
    const thumbnail_half = new ThumbnailHalf({
      location: "location",
      name: "name",
    });
    const trailer = Trailer.create({
      raw_location: "raw_location",
      name: "name",
    });
    const videoMedia = VideoMedia.create({
      raw_location: "raw_location",
      name: "name",
    });
    videos = VideoFakeBuilder.theVideosWithAllMedias(2)
      .withVideoId(videoId)
      .withTitle("name test")
      .withDescription("description test")
      .withYearLaunched(2020)
      .withDuration(90)
      .withRating(Rating.create10())
      .withMarkAsNotOpened()
      .addCategoryId(categoryId1)
      .addCategoryId(categoryId2)
      .addGenreId(genreId1)
      .addGenreId(genreId2)
      .addCastMemberId(castMemberId1)
      .addCastMemberId(castMemberId2)
      .withBanner(banner)
      .withThumbnail(thumbnail)
      .withThumbnailHalf(thumbnail_half)
      .withTrailer(trailer)
      .withVideo(videoMedia)
      .withCreatedAt(created_at)
      .build();
    videos.forEach((video) => {
      expect(video.video_id.id).toBe(videoId.id);
      expect(video.title).toBe("name test");
      expect(video.description).toBe("description test");
      expect(video.year_launched).toBe(2020);
      expect(video.duration).toBe(90);
      expect(video.rating).toEqual(Rating.create10());
      expect(video.is_opened).toBeFalsy();
      expect(video.is_published).toBeFalsy();
      expect(video.banner).toBe(banner);
      expect(video.thumbnail).toBe(thumbnail);
      expect(video.thumbnail_half).toBe(thumbnail_half);
      expect(video.trailer).toBe(trailer);
      expect(video.video).toBe(videoMedia);
      expect(video.categories_id).toBeInstanceOf(Map);
      expect(video.categories_id.get(categoryId1.id)).toBe(categoryId1);
      expect(video.categories_id.get(categoryId2.id)).toBe(categoryId2);
      expect(video.genres_id).toBeInstanceOf(Map);
      expect(video.genres_id.get(genreId1.id)).toBe(genreId1);
      expect(video.genres_id.get(genreId2.id)).toBe(genreId2);
      expect(video.cast_members_id).toBeInstanceOf(Map);
      expect(video.cast_members_id.get(castMemberId1.id)).toBe(castMemberId1);
      expect(video.cast_members_id.get(castMemberId2.id)).toBe(castMemberId2);
      expect(video.created_at).toEqual(created_at);
    });
  });
});
