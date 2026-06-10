import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryDto } from './dto/query.dto';

@Controller('query')
export class QueryController {
  constructor(private queryService: QueryService) {}
  
  @Get()
testGet() {
  return { message: 'Query API is alive! Use POST with {"query": "..."}' };
}
  @Post()
handleQuery(@Body() body: QueryDto) {
    if (!body.query || body.query.trim() === '') {
      throw new BadRequestException('Query cannot be empty');
    }
    return this.queryService.process(body.query);
    //  return await this.queryService.process(body.query);
}
}