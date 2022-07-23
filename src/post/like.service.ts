import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrentUser } from 'src/user/decorator/currenUser';
import { User } from 'src/user/user.entity';
import { ErrorType } from 'src/utils/response/error.type';
import { Repository } from 'typeorm';
import { Post } from './entity/post.entity';
import { PostService } from './post.service';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly postService: PostService,
  ) {}

  /**
   * @description
   *  - (1) 작성자 == 좋아요를 보내려는 사용자라면 좋아요를 누를 수 없음.
   *  - (2) 이미 좋아요를 누른 유저의 경우, 다시 해당 게시물에 좋아요를 누를 수 없음.
   */
  async likePost(id: number, @CurrentUser() user: User): Promise<Post> {
    const existPost = await this.postService.getOnePost(id);

    // (1)
    if (existPost.userId == user.id) throw new BadRequestException(ErrorType.postAuthorIsSame);

    // (2)
    existPost.userLikes.filter(likeUsers => {
      if (likeUsers.id == user.id) throw new BadRequestException(ErrorType.userAlreadyLiked);
    });
    existPost.userLikes.push(user);
    return this.postRepository.save(existPost);
  }

  /**
   * @description
   *  - 게시글의 좋아요를 취소함.
   */
  async deleteLikePost(id: number, user: User): Promise<Post> {
    const existPost = await this.postService.getOnePost(id);

    existPost.userLikes = existPost.userLikes.filter(likeUsers => {
      if (likeUsers.id !== user.id) {
        throw new BadRequestException(ErrorType.invalideLikedUser);
      } else return existPost;
    });
    return this.postRepository.save(existPost);
  }

  /**
   * @description
   *  - 게시글의 좋아요 개수를 count & return
   */
  async countLikePost(id: number) {
    const existPost = await this.postService.getOnePost(id);

    const allLikes = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.userLikes', 'userLikes');
    // .loadRelationCountAndMap('post.likeCount', 'userLikes.id')
    // .getCount('userLike')
    // .getMany();

    console.log(allLikes);

    // return this.postRepository.save(existPost);
  }
}
