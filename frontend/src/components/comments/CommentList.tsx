import React from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import type { Comment } from '@/types/comment';

interface CommentListProps {
  comments: Comment[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onRefresh,
  isRefreshing,
}) => (
  <Box>
    <HStack justifyContent="space-between">
      <Heading as="h4" size="sm" mt={2}>
        Comments:
      </Heading>
      {onRefresh && (
        <IconButton
          aria-label="Refresh comments"
          icon={<RepeatIcon />}
          size="xs"
          onClick={onRefresh}
          isLoading={isRefreshing}
          variant="ghost"
        />
      )}
    </HStack>
    {comments.length === 0 ? (
      <Text fontSize="sm" mt={1} color="textSecondary">
        No comments yet.
      </Text>
    ) : (
      <VStack align="stretch" spacing={3} mt={2}>
        {comments.map((comment) => (
          <Box
            key={comment.id}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            borderColor="borderDecorative"
            bg="bgSurface"
          >
            <Text fontSize="sm" mb={1} color="textPrimary">
              <strong>
                {comment.author_name || comment.user_id || 'Unknown User'}:
              </strong>{' '}
              {comment.content}
            </Text>
            <Text fontSize="xs" color="textSecondary">
              {new Date(comment.created_at).toLocaleString()}
            </Text>
          </Box>
        ))}
      </VStack>
    )}
  </Box>
);

export default CommentList;
