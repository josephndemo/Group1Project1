from marshmallow import Schema, fields, validate

# Marshmallow schemas define API payload validation and response serialization.


class BookSchema(Schema):
    # Shared schema for catalog and user-shelf books.
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    author = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    notes = fields.Str(allow_none=True)
    comment = fields.Str(allow_none=True)
    status = fields.Str(load_default="want_to_read")
    first_published = fields.Str(allow_none=True)
    publisher = fields.Str(allow_none=True)
    cover_url = fields.Str(allow_none=True)
    external_id = fields.Str(allow_none=True)
    shelf_id = fields.Int(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    user_id = fields.Int(dump_only=True)


class ShelfSchema(Schema):
    # Shelf payload schema for CRUD endpoints.
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    description = fields.Str(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    user_id = fields.Int(dump_only=True)


class ReviewSchema(Schema):
    # Review payload schema with rating constraints.
    id = fields.Int(dump_only=True)
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    review_text = fields.Str(allow_none=True)
    is_public = fields.Bool(load_default=True)
    book_id = fields.Int(required=True)
    user_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    book = fields.Nested(BookSchema, dump_only=True)


class FavoriteSchema(Schema):
    # Favorite payload schema for persisted user favorites.
    id = fields.Int(dump_only=True)
    external_id = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    title = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    author = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    cover_url = fields.Str(allow_none=True)
    user_id = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)


book_schema = BookSchema()
book_schema_many = BookSchema(many=True)

shelf_schema = ShelfSchema()
shelf_schema_many = ShelfSchema(many=True)

review_schema = ReviewSchema()
review_schema_many = ReviewSchema(many=True)

favorite_schema = FavoriteSchema()
favorite_schema_many = FavoriteSchema(many=True)
