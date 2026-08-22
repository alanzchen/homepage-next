import type { Post as PostType } from ".contentlayer/generated";
import Post from "components/Post";
import React, { useRef, useState } from "react";

function getRelativeCoordinates(
  event: React.MouseEvent<HTMLUListElement>,
  referenceElement: any
) {
  const position = {
    x: event.pageX,
    y: event.pageY,
  };

  const offset = {
    left: referenceElement.offsetLeft,
    top: referenceElement.clientTop,
    width: referenceElement.clientWidth,
    height: referenceElement.clientHeight,
  };

  let reference = referenceElement.offsetParent;

  while (reference) {
    offset.left += reference.offsetLeft;
    offset.top += reference.offsetTop;
    reference = reference.offsetParent;
  }

  return {
    x: position.x - offset.left,
    y: position.y - offset.top,
  };
}

type PostListProps = {
  posts: PostType[];
  headingLevel?: "h2" | "h3" | "h4";
};

export default function PostList({ posts, headingLevel = "h2" }: PostListProps) {
  const [mousePosition, setMousePosition] = useState({
    x: 240,
    y: 0,
  });
  const listRef = useRef(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLUListElement>) => {
    setMousePosition(getRelativeCoordinates(e, listRef.current));
  };

  return (
    <ul
      ref={listRef}
      onMouseMove={(e) => handleMouseMove(e)}
      className="flex flex-col animated-list"
    >
      {posts.length === 0 && <li><p>No posts found</p></li>}
      {posts.map((post) => (
        <Post
          key={post.slug}
          post={post}
          mousePosition={mousePosition}
          headingLevel={headingLevel}
        />
      ))}
    </ul>
  );
}
