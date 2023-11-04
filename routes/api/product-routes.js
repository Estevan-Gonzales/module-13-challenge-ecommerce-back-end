const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all categories
  try {
    const productData = await Product.findAll({
      include: [{model: Category}]
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
  // be sure to include its associated Categories
});

// get one product
router.get('/:id', async (req, res) => {
  // find one product by its `id` value
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{model: Category}]
    });
    if (!productData) {
      res.status(404).json({message: 'No product found with this ID!'});
      return;
    }
    res.status(200).json(productData);
  } catch {
    res.status(500).json(err);
  }
  // be sure to include its associated categories
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tagId) => {
          console.log(product.id, tagId);
          return {
            productId: product.id,
            tagId,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  // update product data
  const updatedProduct = await Product.update(
    {
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id
    },
    {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { productId: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tagIds
          const productTagIds = productTags.map(({ tagId }) => tagId);
          const newProductTags = req.body.tagIds
            .filter((tagId) => !productTagIds.includes(tagId))
            .map((tagId) => {
              return {
                productId: req.params.id,
                tagId,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tagId }) => !req.body.tagIds.includes(tagId))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});


router.delete('/:id', async (req, res) => {
  // delete a product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });
    if (!productData) {
      res.status(404).json({message: 'No product found with this ID!'});
      return;
    }
    res.status(200).json(productData);
  } catch {
    res.status(500).json(err);
  }
});

module.exports = router;
