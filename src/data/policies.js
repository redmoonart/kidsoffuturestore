/* ============================================================
   سياسات المتجر (البيع، التوصيل، الاستبدال، الخصوصية)
   مكتوبة لتطابق طريقة عمل المتجر الفعلية: دفع عند الاستلام، تأكيد هاتفي،
   توصيل عبر شركة توصيل، استبدال خلال 48 ساعة للمنتجات المعيبة.
   ⚠️ راجعها قبل الاعتماد عليها قانونياً وعدّلها إن تغيّرت طريقة عملك.
   {free} و {store} تُستبدل تلقائياً من STORE_CONFIG.
   ============================================================ */

export const POLICY_SECTIONS = ["terms", "delivery", "returns", "privacy"];

export const POLICIES = {
  ar: {
    title: "سياسات المتجر",
    sub: "شروط البيع، التوصيل، الاستبدال، وحماية بياناتك — بوضوح ومن غير مفاجآت",
    legal_t: "معلومات البائع",
    updated: "آخر تحديث",
    terms: {
      t: "شروط البيع",
      p: [
        "جميع الأسعار المعروضة بالدينار الجزائري (دج) وتشمل كل الرسوم، ما عدا سعر التوصيل الذي يُحسب حسب الولاية ونوع التوصيل ويظهر بوضوح في ملخص الطلب قبل التأكيد.",
        "بعد إرسال طلبك يصلك رقم طلب، ثم نتصل بك هاتفياً لتأكيد الطلب والعنوان قبل الشحن. لا يُشحن أي طلب بدون تأكيد.",
        "الدفع يكون نقداً عند الاستلام لعامل التوصيل. لا نطلب أي معلومات بنكية.",
        "يمكنك إلغاء طلبك مجاناً قبل شحنه بالاتصال بنا.",
      ],
    },
    delivery: {
      t: "التوصيل",
      p: [
        "نوصّل إلى ولايات الجزائر عبر شركة توصيل معتمدة، إلى المنزل أو إلى مكتب التوصيل (Stop Desk) حيث يتوفّر.",
        "مدة التوصيل عادة من 2 إلى 5 أيام عمل بعد تأكيد الطلب، وقد تطول للولايات الجنوبية البعيدة.",
        "الطلبات التي تتجاوز {free} دج تستفيد من التوصيل المجاني.",
        "بعض الولايات البعيدة غير مغطّاة حالياً، وتظهر معطّلة عند اختيار الولاية.",
      ],
    },
    returns: {
      t: "الاستبدال والإرجاع",
      p: [
        "عايِن طلبك عند الاستلام قبل الدفع. إن وصلك منتج معيب أو مختلف عمّا طلبت، يمكنك رفضه مباشرة.",
        "يمكنك طلب الاستبدال خلال 48 ساعة من الاستلام إذا كان في المنتج عيب، بشرط أن يكون بحالته الأصلية وفي غلافه.",
        "تواصل معنا هاتفياً أو عبر البريد لترتيب الاستبدال، ونتكفّل بمصاريف التوصيل إن كان الخطأ منّا.",
      ],
    },
    privacy: {
      t: "الخصوصية وحماية البيانات",
      p: [
        "عند الطلب نجمع فقط ما يلزم لتوصيله: الاسم، رقم الهاتف، الولاية، البلدية/العنوان، والملاحظات التي تكتبها.",
        "تُستعمل هذه المعلومات لتأكيد الطلب وتوصيله فقط، ولا نشاركها إلا مع شركة التوصيل لإيصال طردك. لا نبيعها ولا نستعملها لأغراض إعلانية.",
        "تُحفظ سلة التسوّق واللغة المختارة في متصفحك فقط.",
        "قد نستعمل أداة قياس الإعلانات Meta Pixel لمعرفة فعالية إعلاناتنا على فيسبوك وانستغرام؛ لا تُرسل لها اسمك أو رقم هاتفك.",
        "يمكنك طلب حذف بياناتك في أي وقت بمراسلتنا.",
      ],
    },
  },

  fr: {
    title: "Politiques de la boutique",
    sub: "Conditions de vente, livraison, échange et protection de vos données — clairement",
    legal_t: "Informations du vendeur",
    updated: "Dernière mise à jour",
    terms: {
      t: "Conditions de vente",
      p: [
        "Tous les prix sont affichés en dinars algériens (DA), toutes taxes comprises, hors frais de livraison. Ceux-ci dépendent de la wilaya et du mode de livraison et s'affichent clairement dans le récapitulatif avant confirmation.",
        "Après l'envoi de votre commande, vous recevez un numéro de commande, puis nous vous appelons pour confirmer la commande et l'adresse avant l'expédition. Aucune commande n'est expédiée sans confirmation.",
        "Le paiement se fait en espèces à la livraison, auprès du livreur. Aucune information bancaire n'est demandée.",
        "Vous pouvez annuler gratuitement votre commande avant son expédition en nous contactant.",
      ],
    },
    delivery: {
      t: "Livraison",
      p: [
        "Nous livrons dans les wilayas d'Algérie via une société de livraison agréée, à domicile ou en point de retrait (Stop Desk) lorsqu'il est disponible.",
        "Le délai est généralement de 2 à 5 jours ouvrables après confirmation, parfois plus pour les wilayas du Grand Sud.",
        "Les commandes de plus de {free} DA bénéficient de la livraison gratuite.",
        "Certaines wilayas éloignées ne sont pas encore desservies ; elles apparaissent désactivées lors du choix de la wilaya.",
      ],
    },
    returns: {
      t: "Échange et retour",
      p: [
        "Vérifiez votre commande à la réception avant de payer. Si un produit est défectueux ou ne correspond pas à votre commande, vous pouvez le refuser.",
        "Vous pouvez demander un échange sous 48 h après réception en cas de défaut, à condition que le produit soit dans son état et son emballage d'origine.",
        "Contactez-nous par téléphone ou e-mail pour organiser l'échange ; les frais de livraison sont à notre charge si l'erreur vient de nous.",
      ],
    },
    privacy: {
      t: "Confidentialité et données personnelles",
      p: [
        "Lors d'une commande, nous collectons uniquement le nécessaire à la livraison : nom, téléphone, wilaya, commune/adresse et vos remarques.",
        "Ces informations servent uniquement à confirmer et livrer la commande et ne sont partagées qu'avec la société de livraison. Elles ne sont ni vendues ni utilisées à des fins publicitaires.",
        "Votre panier et la langue choisie sont enregistrés uniquement dans votre navigateur.",
        "Nous pouvons utiliser l'outil de mesure publicitaire Meta Pixel pour évaluer nos publicités sur Facebook et Instagram ; votre nom et votre téléphone ne lui sont pas transmis.",
        "Vous pouvez demander la suppression de vos données à tout moment en nous écrivant.",
      ],
    },
  },

  en: {
    title: "Store policies",
    sub: "Terms of sale, delivery, exchanges and your data — clearly, with no surprises",
    legal_t: "Seller information",
    updated: "Last updated",
    terms: {
      t: "Terms of sale",
      p: [
        "All prices are shown in Algerian dinars (DZD) and include all charges except delivery, which depends on the wilaya and delivery type and is shown clearly in the order summary before you confirm.",
        "After you place an order you receive an order number, then we call you to confirm the order and address before shipping. No order ships without confirmation.",
        "Payment is in cash on delivery, to the courier. We never ask for bank details.",
        "You can cancel your order free of charge before it ships by contacting us.",
      ],
    },
    delivery: {
      t: "Delivery",
      p: [
        "We deliver across Algeria's wilayas through an approved courier, to your home or to a pickup desk (Stop Desk) where available.",
        "Delivery usually takes 2 to 5 working days after confirmation, and can take longer for the far southern wilayas.",
        "Orders over {free} DZD get free delivery.",
        "A few remote wilayas are not covered yet; they appear disabled when choosing your wilaya.",
      ],
    },
    returns: {
      t: "Exchanges and returns",
      p: [
        "Check your order on delivery before paying. If a product is defective or not what you ordered, you can refuse it.",
        "You can request an exchange within 48 hours of delivery for a defective product, provided it is in its original condition and packaging.",
        "Contact us by phone or email to arrange the exchange; we cover the delivery cost when the mistake is ours.",
      ],
    },
    privacy: {
      t: "Privacy and data protection",
      p: [
        "When you order we collect only what delivery needs: name, phone, wilaya, municipality/address, and any notes you write.",
        "This information is used only to confirm and deliver your order, and is shared only with the courier delivering your parcel. We never sell it or use it for advertising.",
        "Your cart and chosen language are stored only in your browser.",
        "We may use the Meta Pixel ad-measurement tool to see how our Facebook and Instagram ads perform; your name and phone number are never sent to it.",
        "You can ask us to delete your data at any time by contacting us.",
      ],
    },
  },
};

export const POLICIES_UPDATED = "2026-10-08";
