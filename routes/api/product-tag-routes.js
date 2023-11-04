const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');


router.get('/', async (req, res) => {
  // find all product tags
  try {
    const productTagData = await ProductTag.findAll();
    res.status(200).json(productTagData);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.get('/:id', async (req, res) => {
  // find a single product product tag by its `id`
  try {
    const productTagData = await ProductTag.findByPk(req.params.id);
    if (!productTagData) {
      res.status(404).json({message: 'No product tag found with this ID!'});
      return;
    }
    res.status(200).json(productTagData);
  } catch {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new product tag
  try {
    const ProductTagData = await ProductTag.create(req.body);
    res.status(200).json(ProductTagData);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a product tag's name by its `id` value
  const updatedProductTag = await ProductTag.update(
    {
      productId: req.body.productId,
      tagId: req.body.tagId
    },
    {
      where: {
        id:  req.params.id
      }
    }
  );
  res.json(updatedProductTag);
});

router.delete('/:id', async (req, res) => {
  // delete a product tag by its `id` value
  try {
    const productTagData = await ProductTag.destroy({
      where: {
        id: req.params.id
      }
    });
    if (!productTagData) {
      res.status(404).json({message: 'No product tag found with this ID!'});
      return;
    }
    res.status(200).json(productTagData);
  } catch {
    res.status(500).json(err);
  }
});

module.exports = router;
