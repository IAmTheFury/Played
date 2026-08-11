// Test du calcul de rognage de photo de profil
// Vérification que l'image couvre bien tout le canvas de sortie

function testCropCalculation() {
  // Paramètres constants
  const containerSize = 256; // taille du conteneur UI (size-64 = 64*4)
  const ringWidth = 48; // ring-[48px]
  const visibleSize = containerSize - 2 * ringWidth; // 160px
  const canvasSize = 400;
  const outputToVisibleRatio = canvasSize / visibleSize; // 2.5

  console.log('=== Test du calcul de rognage ===');
  console.log(`containerSize: ${containerSize}px`);
  console.log(`ringWidth: ${ringWidth}px`);
  console.log(`visibleSize: ${visibleSize}px`);
  console.log(`canvasSize: ${canvasSize}px`);
  console.log(`outputToVisibleRatio: ${outputToVisibleRatio}`);
  console.log('');

  // Fonction de calcul identique à handleSaveCrop
  function calculateFinalScale(imgWidth, imgHeight, zoom = 1) {
    const baseScale = containerSize / Math.min(imgWidth, imgHeight);
    const finalScale = zoom * baseScale * outputToVisibleRatio;
    return finalScale;
  }

  // Test 1: Image carrée (cas simple)
  console.log('Test 1: Image carrée 500x500');
  const finalScale1 = calculateFinalScale(500, 500);
  const imgSize1 = 500 * finalScale1;
  console.log(`  finalScale: ${finalScale1}`);
  console.log(`  Image sur canvas: ${imgSize1}x${imgSize1}px`);
  console.log(`  Couvre canvas? ${imgSize1 >= canvasSize ? 'OUI' : 'NON'} (${imgSize1} >= ${canvasSize})`);
  console.log('');

  // Test 2: Image rectangulaire large (test critique)
  console.log('Test 2: Image rectangulaire large 800x200');
  const finalScale2 = calculateFinalScale(800, 200);
  const imgWidth2 = 800 * finalScale2;
  const imgHeight2 = 200 * finalScale2;
  console.log(`  finalScale: ${finalScale2}`);
  console.log(`  Image sur canvas: ${imgWidth2}x${imgHeight2}px`);
  console.log(`  Couvre canvas en largeur? ${imgWidth2 >= canvasSize ? 'OUI' : 'NON'} (${imgWidth2} >= ${canvasSize})`);
  console.log(`  Couvre canvas en hauteur? ${imgHeight2 >= canvasSize ? 'OUI' : 'NON'} (${imgHeight2} >= ${canvasSize})`);
  console.log('');

  // Test 3: Image rectangulaire haute
  console.log('Test 3: Image rectangulaire haute 200x800');
  const finalScale3 = calculateFinalScale(200, 800);
  const imgWidth3 = 200 * finalScale3;
  const imgHeight3 = 800 * finalScale3;
  console.log(`  finalScale: ${finalScale3}`);
  console.log(`  Image sur canvas: ${imgWidth3}x${imgHeight3}px`);
  console.log(`  Couvre canvas en largeur? ${imgWidth3 >= canvasSize ? 'OUI' : 'NON'} (${imgWidth3} >= ${canvasSize})`);
  console.log(`  Couvre canvas en hauteur? ${imgHeight3 >= canvasSize ? 'OUI' : 'NON'} (${imgHeight3} >= ${canvasSize})`);
  console.log('');

  // Test 4: Image très grande
  console.log('Test 4: Image très grande 2000x1500');
  const finalScale4 = calculateFinalScale(2000, 1500);
  const imgWidth4 = 2000 * finalScale4;
  const imgHeight4 = 1500 * finalScale4;
  console.log(`  finalScale: ${finalScale4}`);
  console.log(`  Image sur canvas: ${imgWidth4}x${imgHeight4}px`);
  console.log(`  Couvre canvas? ${Math.min(imgWidth4, imgHeight4) >= canvasSize ? 'OUI' : 'NON'}`);
  console.log('');

  // Test 5: Image très petite
  console.log('Test 5: Image très petite 100x80');
  const finalScale5 = calculateFinalScale(100, 80);
  const imgWidth5 = 100 * finalScale5;
  const imgHeight5 = 80 * finalScale5;
  console.log(`  finalScale: ${finalScale5}`);
  console.log(`  Image sur canvas: ${imgWidth5}x${imgHeight5}px`);
  console.log(`  Couvre canvas? ${Math.min(imgWidth5, imgHeight5) >= canvasSize ? 'OUI' : 'NON'}`);
  console.log('');

  // Vérification du bug original
  console.log('=== Vérification du bug ===');
  console.log('Bug: "l\'image n\'occupe qu\'une partie du cadre final, le reste du cadre est noir"');
  console.log('Cela se produit si l\'image ne couvre pas tout le canvas.');
  console.log('');
  
  // Calcul de l'ancienne méthode (avant correction)
  const oldScaleFactor = canvasSize / containerSize; // 400/256 = 1.5625
  function oldCalculateFinalScale(imgWidth, imgHeight, zoom = 1) {
    const baseScale = containerSize / Math.min(imgWidth, imgHeight);
    const finalScale = zoom * baseScale * oldScaleFactor;
    return finalScale;
  }

  console.log('Comparaison avec l\'ancien calcul (buggé):');
  console.log(`Ancien scaleFactor: ${oldScaleFactor} (canvas/container)`);
  console.log(`Nouveau scaleFactor: ${outputToVisibleRatio} (canvas/visibleSize)`);
  console.log(`Ratio nouveau/ancien: ${outputToVisibleRatio / oldScaleFactor}x plus grand`);
  console.log('');

  // Test avec image 800x200
  const oldFinalScale2 = oldCalculateFinalScale(800, 200);
  const oldImgHeight2 = 200 * oldFinalScale2;
  console.log('Pour image 800x200:');
  console.log(`  Ancienne hauteur sur canvas: ${oldImgHeight2}px`);
  console.log(`  Nouvelle hauteur sur canvas: ${imgHeight2}px`);
  console.log(`  Différence: ${imgHeight2 - oldImgHeight2}px (${(imgHeight2/oldImgHeight2).toFixed(2)}x)`);
  console.log(`  Ancien: couvre ${oldImgHeight2 >= canvasSize ? 'OUI' : 'NON'} (${oldImgHeight2} >= ${canvasSize})`);
  console.log(`  Nouveau: couvre ${imgHeight2 >= canvasSize ? 'OUI' : 'NON'} (${imgHeight2} >= ${canvasSize})`);
  console.log('');

  // Conclusion
  console.log('=== Conclusion ===');
  const allTestsPass = imgSize1 >= canvasSize && 
                      imgHeight2 >= canvasSize && 
                      imgWidth3 >= canvasSize &&
                      Math.min(imgWidth4, imgHeight4) >= canvasSize;
  
  if (allTestsPass) {
    console.log('✅ Tous les tests passent! L\'image couvre toujours le canvas.');
    console.log('La correction devrait résoudre le bug des zones noires.');
  } else {
    console.log('❌ Certains tests échouent. Revoir le calcul.');
  }
}

// Exécuter le test
testCropCalculation();