/**
 * This file contains examples of how to use the factory approach
 * It is not part of the package exports
 */

import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { createModelModule } from './module-factory';
import { createDtos } from './dto-factory';
import { createModelService } from './service-factory';
import { createModelController } from './controller-factory';

// Define types for our models - in a real app, these would come from Prisma's generated types
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example 1: Auto-generate an entire module for a model
// This is the simplest approach - one line gives you a complete module
const UserModule = createModelModule({
  modelName: 'User',
  prismaModelKey: 'user',
  routePath: 'users',
});

// Example 2: Auto-generate individual components
// This gives you more control if you need to customize certain parts

// Generate DTOs
const { CreateDto: CreatePostDto, UpdateDto: UpdatePostDto, ResponseDto: PostResponseDto } = createDtos<Post>('Post');

// Generate a service
const PostService = createModelService<Post>('Post', 'post');

// Generate a controller
const PostController = createModelController<Post>('Post', 'posts', PostService);

// Put it all together manually
@Module({
  imports: [PrismaModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}

// Example 3: Using the generated components
// In your main app.module.ts
@Module({
  imports: [
    PrismaModule.forRoot(),
    UserModule, // Auto-generated module
    PostModule, // Manually assembled module
  ],
})
export class AppModule {}

// Example 4: Extending auto-generated components with custom functionality
// First, generate the base service
const BaseUserService = createModelService<User>('User', 'user');

// Then extend it with custom methods
class ExtendedUserService extends BaseUserService {
  // The modelName is inherited from BaseUserService
  protected override readonly modelName = 'user';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Add custom methods
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    }) as Promise<User | null>;
  }

  async findWithPosts(id: string): Promise<(User & { posts: Post[] }) | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { posts: true },
    }) as Promise<(User & { posts: Post[] }) | null>;
  }
}
