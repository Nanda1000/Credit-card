export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Custom known errors (with statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma-specific errors
  if (err.code === "P2002") { // unique constraint
    return res.status(409).json({ error: "Duplicate entry" });
  }

  // Default: Internal server error
  res.status(500).json({
    error: "Something went wrong on the server",
    details: process.env.NODE_ENV === "development" ? err.message : undefined
  });
};
