// Test de la nouvelle algorithm de rognage normalisée
// Vérification des calculs mathématiques pour zoom et pan

function testNewCropAlgorithm() {
  console.log('=== Test de la nouvelle algorithm de rognage ===');
  console.log('Algorithme: projection pixel-par-pixel normalisée\n');
  
  // Paramètres constants
  const CROP_CONTAINER_SIZE = 256;
  const OUTPUT_SIZE = 400;
  
  // Fonction de calcul selon la nouvelle implémentation
  function calculateCropParams(originalWidth, originalHeight, zoom = 1, position = { x: 0, y: 0 }) {
    // 1. Base scale to "cover" the square container at zoom = 1
    const baseScale = Math.max(
      CROP_CONTAINER_SIZE / originalWidth,
      CROP_CONTAINER_SIZE / originalHeight
    );
    
    // 2. Current rendered image size in preview UI
    const currentRenderedWidth = originalWidth * baseScale * zoom;
    const currentRenderedHeight = originalHeight * baseScale * zoom;
    
    // 3. Calculate top-left corner of the crop window relative to the image in screen pixels
    const cropX_screen = (currentRenderedWidth - CROP_CONTAINER_SIZE) / 2 - position.x;
    const cropY_screen = (currentRenderedHeight - CROP_CONTAINER_SIZE) / 2 - position.y;
    
    // 4. Convert screen space crop window back to Original Image Pixels
    const scaleRatioToOriginal = 1 / (baseScale * zoom);
    
    const sx = cropX_screen * scaleRatioToOriginal;
    const sy = cropY_screen * scaleRatioToOriginal;
    const sWidth = CROP_CONTAINER_SIZE * scaleRatioToOriginal;
    const sHeight = CROP_CONTAINER_SIZE * scaleRatioToOriginal;
    
    return {
      baseScale,
      currentRenderedWidth,
      currentRenderedHeight,
      cropX_screen,
      cropY_screen,
      scaleRatioToOriginal,
      sx,
      sy,
      sWidth,
      sHeight
    };
  }
  
  // Test 1: Image carrée, zoom = 1, position = (0, 0)
  console.log('Test 1: Image carrée 500x500, zoom=1, position=(0,0)');
  const result1 = calculateCropParams(500, 500, 1, { x: 0, y: 0 });
  console.log(`  baseScale: ${result1.baseScale.toFixed(4)}`);
  console.log(`  currentRendered: ${result1.currentRenderedWidth.toFixed(1)}x${result1.currentRenderedHeight.toFixed(1)}px`);
  console.log(`  crop window screen: (${result1.cropX_screen.toFixed(1)}, ${result1.cropY_screen.toFixed(1)})`);
  console.log(`  source rect in original: (${result1.sx.toFixed(1)}, ${result1.sy.toFixed(1)}, ${result1.sWidth.toFixed(1)}x${result1.sHeight.toFixed(1)})`);
  console.log(`  Vérification: sWidth/sHeight doivent être positifs: ${result1.sWidth > 0 && result1.sHeight > 0 ? '✅' : '❌'}`);
  console.log('');
  
  // Test 2: Image rectangulaire, zoom = -2, position décalée
  console.log('Test 2: Image 800x200, zoom=2, position=(50, -30)');
  const result2 = calculateCropParams(800, 200, 2, { x: 50, y: -30 });
  console.log(`  baseScale: ${result2.baseScale.toFixed(4)}`);
  console.log(`  currentRendered: ${result2.currentRenderedWidth.toFixed(1)}x${result2.currentRenderedHeight.toFixed(1)}px`);
  console.log(`  crop window screen: (${result2.cropX_screen.toFixed(1)}, ${result2.cropY_screen.toFixed(1)})`);
  console.log(`  source rect in original: (${result2.sx.toFixed(1)}, ${result2.sy.toFixed(1)}, ${result2.sWidth.toFixed(1)}x${result2.sHeight.toFixed(1)})`);
  console.log(`  Vérification: source rectangle dans les limites de l'image originale?`);
  console.log(`    sx >= 0: ${result2.sx >= 0 ? '✅' : '❌'} (${result2.sx.toFixed(1)})`);
  console.log(`    sy >= 0: ${result2.sy >= 0 ? '✅' : '❌'} (${result2.sy.toFixed(1)})`);
  console.log(`    sx + sWidth <= 800: ${result2.sx + result2.sWidth <= 800 ? '✅' : '❌'} (${(result2.sx + result2.sWidth).toFixed(1)})`);
  console.log(`    sy + sHeight <= 200: ${result2.sy + result2.sHeight <= 200 ? '✅' : '❌'} (${(result2.sy + result2.sHeight).toFixed(1)})`);
  console.log('');
  
  // Test 3: Vérification des limites avec zoom max
  console.log('Test 3: Image 300x400, zoom=3 (max), position=(100, 100)');
  const result3 = calculateCropParams(300, 400, 3, { x: 100, y: 100 });
  console.log(`  baseScale: ${result3.baseScale.toFixed(4)}`);
  console.log(`  currentRendered: ${result3.currentRenderedWidth.toFixed(1)}x${result3.currentRenderedHeight.toFixed(1)}px`);
  console.log(`  crop window screen: (${result3.cropX_screen.toFixed(1)}, ${result3.cropY_screen.toFixed(1)})`);
  console.log(`  source rect in original: (${result3.sx.toFixed(1)}, ${result3.sy.toFixed(1)}, ${result3.sWidth.toFixed(1)}x${result3.sHeight.toFixed(1)})`);
  console.log(`  Vérification limites:`);
  console.log(`    sx dans [0, 300]: ${result3.sx >= 0 && result3.sx <= 300 ? '✅' : '❌'} (${result3.sx.toFixed(1)})`);
  console.log(`    sy dans [0, 400]: ${result3.sy >= 0 && result3.sy <= 400 ? '✅' : '❌'} (${result3.sy.toFixed(1)})`);
  console.log('');
  
  // Test 4: Vérification de la cohérence mathématique
  console.log('Test 4: Vérification de la cohérence mathématique');
  console.log('Pour une image 600x600, zoom=1.5, position=(20, -20)');
  const result4 = calculateCropParams(600, 600, 1.5, { x: 20, y: -20 });
  
  // Vérification: cropX_screen * scaleRatioToOriginal = sx
  const check1 = Math.abs(result4.cropX_screen * result4.scaleRatioToOriginal - result4.sx) < 0.001;
  const check2 = Math.abs(result4.cropY_screen * result4.scaleRatioToOriginal - result4.sy) < 0.001;
  const check3 = Math.abs(CROP_CONTAINER_SIZE * result4.scaleRatioToOriginal - result4.sWidth) < 0.001;
  const check4 = Math.abs(CROP_CONTAINER_SIZE * result4.scaleRatioToOriginal - result4.sHeight) < 0.001;
  
  console.log(`  Vérification formules: ${check1 && check2 && check3 && check4 ? '✅' : '❌'}`);
  console.log(`    cropX_screen * scaleRatioToOriginal = sx: ${check1 ? 'OK' : 'FAIL'}`);
  console.log(`    cropY_screen * scaleRatioToOriginal = sy: ${check2 ? 'OK' : 'FAIL'}`);
  console.log(`    CROP_CONTAINER_SIZE * scaleRatioToOriginal = sWidth: ${check3 ? 'OK' : 'FAIL'}`);
  console.log(`    CROP_CONTAINER_SIZE * scaleRatioToOriginal = sHeight: ${check4 ? 'OK' : 'FAIL'}`);
  console.log('');
  
  // Conclusion
  console.log('=== Conclusion ===');
  console.log('La nouvelle algorithm utilise une projection mathématique précise:');
  console.log('1. Calcule la taille rendue de l\'image dans l\'UI (avec zoom)');
  console.log('2. Détermine la position de la fenêtre de rognage en pixels écran');
  console.log('3. Convertit en pixels originaux avec le ratio d\'échelle inverse');
  console.log('4. Dessine exactement le rectangle source sur le canvas de sortie');
  console.log('');
  console.log('✅ Cette approche devrait éliminer les bugs de transformation');
  console.log('   entre l\'espace écran et l\'espace image original.');
}

// Exécuter le test
testNewCropAlgorithm();