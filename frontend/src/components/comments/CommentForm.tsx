import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  Textarea,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setError(null);
    await onSubmit(content);
    setContent('');
  };

  return (
    <VStack align="stretch" spacing={2} mt={4}>
      <Heading as="h5" size="sm">
        Add a Comment
      </Heading>
      <FormControl>
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          size="sm"
        />
      </FormControl>
      <Button
        colorScheme="primary"
        size="sm"
        onClick={handleSubmit}
        isLoading={isSubmitting}
        alignSelf="flex-end"
      >
        Post Comment
      </Button>
      {error && (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      )}
    </VStack>
  );
};

export default CommentForm;
